"use server";
import "server-only";
// react
import { cache } from "react";
// next.js
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
// database
import dbConnect from "./database";
import User from "./models/User";
import Word from "./models/Word";
import Journal from "@/app/lib/models/Journal";
// session
import { decrypt, deleteSession } from "./session";
// methods
import { areDatesSame } from "./helper";
// settings
import { DICTIONARY_ONE_PAGE } from "./config/settings";
// types
import {
  Collections,
  DictionaryData,
  DictionaryLanguage,
  IndexedDBData,
  IndexedDBType,
  Language,
  WordData,
} from "./config/types/others";
// library
import { translate } from "@vitalets/google-translate-api";
// import JapaneseDictionary from "japaneasy";
import JishoAPI from "unofficial-jisho-api";
import { englishDictionary } from "./dictionary/Dictionary";

// const NUM_WORDS_PER_PAGE_DICTIONARY = 10;

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userId = session?.userId;

  if (!userId) redirect("/login");

  return { isAuth: true, userId };
});

export const getUser = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return null;
    const userObject = JSON.parse(JSON.stringify(user));

    return userObject;
  } catch (err: unknown) {
    console.error("Unexpected error occured.", err);
    return null;
  }
});

export const getCollections = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return null;

    const userObject = JSON.parse(JSON.stringify(user));

    return userObject.collections as Collections;
  } catch (err: unknown) {
    console.error("Fetch failed", err);
    return null;
  }
});

export async function logout(language: Language) {
  await deleteSession();
  redirect(`/${language}`);
}

export const getUserWords = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const words = await Word.find({ userId }).exec();
    if (!words) return [];

    return JSON.parse(JSON.stringify(words));
  } catch (err: unknown) {
    console.error("Fetch failed.", err);
    return null;
  }
});

// journal
export const getJournals = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const journals = await Journal.find({ userId }).exec();

    return JSON.parse(JSON.stringify(journals));
  } catch (err: unknown) {
    console.error("Unexpected error occured.", err);
    return null;
  }
});

export const getJournalDataDate = cache(
  async (collectionId: string, date: Date | string) => {
    await verifySession();
    try {
      await dbConnect();
      const journalsCollection = await Journal.find({
        collectionId,
      }).exec();
      if (!journalsCollection) return {};

      const journalDataDate = journalsCollection.find((col) =>
        areDatesSame(col.journal.date, date),
      );

      return journalDataDate ? JSON.parse(JSON.stringify(journalDataDate)) : {};
    } catch (err: unknown) {
      console.error("Unexpected error occured.", err);
      return null;
    }
  },
);

export const deleteTestDataFromMongoDB = async () => {
  try {
    await dbConnect();
    const users = await User.deleteMany({ email: /@example.com/i });
    console.log(users);
  } catch (err) {
    console.error("Error", err);
  }
};

export const getDataForIndexedDB = cache(
  async (type: "all" | IndexedDBType) => {
    await verifySession();

    try {
      if (type === "test") return;

      const data: IndexedDBData = {};

      if (type === "all" || type === "collections") {
        const collections = await getCollections();
        if (collections) data.collections = collections;
      }

      if (type === "all" || type === "words") {
        const words = await getUserWords();
        if (words) data.words = words;
      }

      if (type === "all" || type === "journals") {
        const journals = await getJournals();
        if (journals) data.journals = journals;
      }

      return data;
    } catch (err: unknown) {
      console.error("Unexpected error occured", err);
      return null;
    }
  },
);

export const sendWordsIndexedDBToMongoDB = async (words: WordData[]) => {
  await verifySession();

  try {
    await dbConnect();
    await Promise.all(
      words.map((word) => {
        const { _id, ...others } = word;
        // console.log(word, { ...others });
        return Word.findByIdAndUpdate(_id, { ...others });
      }),
    );
  } catch (err) {
    throw err;
  }
};

export const sendIndexedDBToMongoDB = async (data: IndexedDBData) => {
  const { isAuth, userId } = await verifySession();
  try {
    const { collections, words, journals } = data;
    await dbConnect();

    if (collections) {
      // const collectionsWithoutId = collections.map((col) => {
      //   const { _id, ...others } = col;
      //   return { ...others };
      // });

      const user = await User.findById(userId).select("collections");
      user.collections = collections;

      await user.save();
    }

    if (words)
      await Promise.all(
        words.map((word) => {
          const { _id, ...others } = word;
          // console.log(word, { ...others });
          return Word.findByIdAndUpdate(_id, { ...others });
        }),
      );

    if (journals)
      await Promise.all(
        journals.map((journal) => {
          const { _id, ...others } = journal;
          // console.log(journal, { ...others });

          return Journal.findByIdAndUpdate(_id, { ...others });
        }),
      );
  } catch (err) {
    throw err;
  }
};

export const dictionary = cache(
  async (
    word: string,
    dictionaryLanguage: DictionaryLanguage,
    searchLanguage: DictionaryLanguage,
    curPage: number, // 0 base
  ) => {
    try {
      const indexFrom = DICTIONARY_ONE_PAGE * curPage;
      const indexTo = indexFrom + DICTIONARY_ONE_PAGE;

      if (!word) return;

      // if user searched in language other than dictionary language => translate it first to dictionary language
      const translatedWord =
        searchLanguage === dictionaryLanguage
          ? word
          : (await translate(word, { to: dictionaryLanguage })).text;

      if (dictionaryLanguage === "ja" && searchLanguage === "ja") {
        const res = await fetch(
          `https://api.dictionaryapi.dev/${translatedWord}`,
        );
        const data = res.ok ? await res.json() : null;

        if (!data || data?.title)
          return {
            totalNumberOfResults: 0,
            results: [],
          };

        const dataCurPage = data.slice(indexFrom, indexTo);

        return {
          totalNumberOfResults: data.length,
          results: dataCurPage.map(
            (data: {
              word: string;
              phonetic: string;
              phonetics: { text: string; audio?: string }[];
              origin: string;
              meanings: {
                partOfSpeech: string;
                definitions: {
                  definition: string;
                  example: string;
                  synonyms: string[];
                  antonyms: [];
                }[];
              }[];
            }) => {
              const phoneticTexts = data.phonetics.map(
                (phonetic) => phonetic.text,
              );
              const definitions = data.meanings.map(
                (m) => m.definitions[0].definition,
              );
              const examples = data.meanings.map(
                (m) => m.definitions[0].example,
              );
              const synonyms = data.meanings.flatMap(
                (m) => m.definitions[0].synonyms,
              );

              return {
                name: data.word,
                pronunciationString: phoneticTexts.join(" "),
                pronunciationAudio: data.phonetics[0]?.audio || "",
                definitions,
                examples,
                synonyms,
              };
            },
          ),
        };
      }

      if (dictionaryLanguage === "ja" && searchLanguage === "en") {
        const dict = new JishoAPI();
        const wordData = (await dict.searchForPhrase(
          translatedWord,
        )) as unknown as {
          meta: { status: number };
          data: {
            slug: string;
            is_common: boolean;
            tags: string[];
            jlpt: string[];
            japanese: { word: string; reading: string }[];
            senses: { english_definitions: string[][] }[];
            attribution: {
              jmdict: boolean;
              jmnedict: boolean;
              dbpedia: boolean;
            };
          }[];
        };

        // const dict = new JapaneseDictionary();
        // const data = await dict(word);

        // if (typeof data[0] === "string")
        //   return {
        //     totalNumberOfResults: 0,
        //     results: [],
        //   };

        if (!Array.isArray(wordData.data))
          return {
            totalNumberOfResults: 0,
            results: [],
          };

        // filter out long weird Jisho string word data that contains number
        const wordDataWithoutWeirdString = wordData.data.filter((data) => {
          const wordName = data.slug;
          const regexNumber = /\d/;
          return wordName.length < 10 || !regexNumber.test(wordName);
        });

        const wordDataCurPage = wordDataWithoutWeirdString.slice(
          indexFrom,
          indexTo,
        );

        // fetch example sentence data of the fetched words
        const exampleDataCurPage = (await Promise.all(
          wordDataCurPage.map((data) => dict.searchForExamples(data.slug)),
        )) as unknown as {
          query: string;
          found: boolean;
          results: {
            english: string;
            kanji: string;
            kana: string;
            pieces: [];
          }[];
        }[];

        return {
          totalNumberOfResults: wordData.data.length,
          results: wordDataCurPage.map(
            (data, i) => {
              const allUniquePronunciations = new Set(
                data.japanese.map((obj) => obj.reading),
              );
              const allDefinitions = data.senses.flatMap(
                (sense) => sense.english_definitions,
              );
              return {
                name: data.slug,
                pronunciationString: [...allUniquePronunciations].join("、"),
                pronunciationAudio: "",
                definitions: allDefinitions,
                examples: exampleDataCurPage[i].found
                  ? exampleDataCurPage[i].results
                      .slice(0, 2)
                      .map((res) => res.kanji)
                  : [],
                synonyms: [],
              };
            },
            // (data: {
            //   japanese: string;
            //   pos: string;
            //   pronunciation?: string;
            //   english: string[];
            // }) => {
            //   return {
            //     name: data.japanese,
            //     pronunciationString: data.pronunciation || "",
            //     pronunciationAudio: "",
            //     definitions: data.english,
            //     examples: [],
            //     synonyms: [],
            //   };
            // },
          ),
        };
      }

      // audio not working because of server down of the api
      // search not working sometimes either probably because of the same reason?

      // when I add this, => error occurs the middleware cannot be found
      // if (dictionaryLanguage === "en") {
      //   console.log(englishDictionary.lookup("fine"));
      //   return {
      //     totalNumberOfResults: 0,
      //     results: [],
      //   };

      const res = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${translatedWord}`,
      );
      const data = res.ok ? await res.json() : null;
      if (!data || data?.title)
        return {
          totalNumberOfResults: 0,
          results: [],
        };
      const dataCurPage = data.slice(indexFrom, indexTo);
      return {
        totalNumberOfResults: data.length,
        results: dataCurPage.map(
          (data: {
            word: string;
            phonetic: string;
            phonetics: { text: string; audio?: string }[];
            origin: string;
            meanings: {
              partOfSpeech: string;
              definitions: {
                definition: string;
                example: string;
                synonyms: string[];
                antonyms: [];
              }[];
            }[];
          }) => {
            const phoneticTexts = data.phonetics.map(
              (phonetic) => phonetic.text,
            );
            const definitions = data.meanings.map(
              (m) => m.definitions[0].definition,
            );
            const examples = data.meanings.map((m) => m.definitions[0].example);
            const synonyms = data.meanings.flatMap(
              (m) => m.definitions[0].synonyms,
            );
            return {
              name: data.word,
              pronunciationString: phoneticTexts.join(" "),
              pronunciationAudio: data.phonetics[0]?.audio || "",
              definitions,
              examples,
              synonyms,
            };
          },
        ),
      };
    } catch (err) {
      console.error("Error", err);
      return null;
    }
  },
);

export const translator = async (
  result: DictionaryData,
  outputLanguage: DictionaryLanguage,
) => {
  try {
    const translatedDefinitions = await Promise.all(
      result.definitions.map((def) => translate(def, { to: outputLanguage })),
    );

    // const translatedExamples = await Promise.all(
    //   result.examples.map((exam) => translate(exam, { to: outputLanguage })),
    // );

    const newResult = { ...result };
    newResult.definitions = translatedDefinitions.map((def) => def.text);
    // newResult.examples = translatedExamples.map((exam) => exam.text);
    return newResult;
  } catch (err) {
    console.error("Error", err);
    return null;
  }
};
