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
// types
import {
  Collections,
  IndexedDBData,
  IndexedDBType,
  Language,
} from "./config/types/others";

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

// export const getCollectionDataCurPage = cache(
//   async (indexFrom: number, indexTo: number) => {
//     const { isAuth, userId } = await verifySession();
//     try {
//       const collections = await getCollections();
//       if (!collections) return null;

//       const collectionsCurPage = collections.slice(
//         indexFrom,
//         indexTo,
//       ) as Collections;

//       // get numberOfWords for collections on current page
//       const numberOfWordsCollections = await Promise.all(
//         collectionsCurPage.map((col: Collection) =>
//           // if it's collection 'All' => counts all user words, otherwise => counts words in the collection
//           col.allWords
//             ? Word.countDocuments({ userId })
//             : Word.countDocuments({ collectionId: col._id }),
//         ),
//       );

//       return {
//         collections: collectionsCurPage.map((col, i) => {
//           return { ...col, numberOfWords: numberOfWordsCollections[i] };
//         }),
//         numberOfCollections: collections.length,
//       };
//     } catch (err: unknown) {
//       console.error("Unexpected error occured.", err);
//       return null;
//     }
//   },
// );

export async function logout(language: Language) {
  await deleteSession();
  sessionStorage.removeItem("isAlreadySynced");
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

// export const getUserWordsCollection = cache(async (collectionId: string) => {
//   const allWords = await getUserWords();
//   // if user doens't have any words, return []
//   if (isArrayEmpty(allWords)) return [];
//   if (!allWords) return null;

//   // check if the collectionId is of the collection 'All', if so, return allWords
//   const collections = await getCollections();
//   if (!collections) return null;
//   const isCollectionAll = collections.find(
//     (col: Collection) => col.allWords && String(col._id) === collectionId,
//   );
//   if (isCollectionAll) return allWords;

//   // otherwise return words in the collection
//   const wordsForCollection = allWords.filter(
//     (word: WordData) => word.collectionId === collectionId,
//   );
//   return wordsForCollection;
// });

// export const getUserWordsStatuses = cache(async (collectionId: string) => {
//   const wordsForCollection = await getUserWordsCollection(collectionId);
//   // if no words, return []
//   if (isArrayEmpty(wordsForCollection)) return [];
//   if (!wordsForCollection) return null;

//   const statuses = new Array(6).fill(0);
//   wordsForCollection.forEach((word: WordData) => (statuses[word.status] += 1));

//   return statuses;
// });

// export const getMatchedWordsCurPage = cache(
//   async (collectionId: string, value: string, curPage: number) => {
//     const indexFrom = (curPage - 1) * LISTS_ONE_PAGE;
//     const indexTo = indexFrom + LISTS_ONE_PAGE;

//     const wordsForCollection = await getUserWordsCollection(collectionId);
//     if (!wordsForCollection) return null;

//     const matchedWords = value
//       ? wordsForCollection.filter((word: WordData) => word.name.includes(value))
//       : wordsForCollection;

//     // get only words that are needed to curPage
//     const matchedWordsCurPage = matchedWords.slice(indexFrom, indexTo);

//     return {
//       numberOfMatchedWords: matchedWords.length,
//       matchedWordsCurPage: matchedWordsCurPage,
//     };
//   },
// );

// flashcard
// export const getRandomWordsFlashcard = cache(async (collectionId: string) => {
//   const wordsForCollection = await getUserWordsCollection(collectionId);
//   if (!wordsForCollection) return null;
//   // if no words, return []
//   if (isArrayEmpty(wordsForCollection)) return [];

//   const numberOfWords = wordsForCollection.length;

//   //   If totalNumberOfWords is less than maxWordsOneTurn, set all words
//   if (FLASHCARD_QUIZ_ONE_TURN > numberOfWords) return wordsForCollection;

//   const randomNumbersSet: Set<number> = new Set([]);

//   //   until set gets 20 random numbers
//   while (randomNumbersSet.size < FLASHCARD_QUIZ_ONE_TURN) {
//     // minus 1 because it's gonna be used as an index and indexes are 0 base
//     randomNumbersSet.add(getRandomNumber(0, numberOfWords - 1));
//   }

//   const randomNumbersArray = Array.from(randomNumbersSet);

//   //   get random words using random numbers as indexes
//   const randomWords = randomNumbersArray.map((num) => wordsForCollection[num]);

//   return randomWords;
// });

// export const getRandomWordsOneTurnQuiz = cache(async (collectionId: string) => {
//   const wordsForCollection = await getUserWordsCollection(collectionId);
//   if (!wordsForCollection) return null;
//   // if no words, return []
//   if (isArrayEmpty(wordsForCollection)) return [];

//   //   get words nextReviewAt time is now or before now
//   const wordsToReview = (wordsForCollection as WordData[]).filter(
//     (word) => Date.now() - new Date(word.nextReviewAt).getTime() >= 0,
//   );

//   // get only words that are needed for one turn
//   const wordsToReviewCurTurn = wordsToReview.slice(0, FLASHCARD_QUIZ_ONE_TURN);

//   return wordsToReviewCurTurn;
// });

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

export const getDataForIndexedDB = cache(
  async (type: "all" | IndexedDBType) => {
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

export const sendIndexedDBToMongoDB = async (data: IndexedDBData) => {
  const { isAuth, userId } = await verifySession();
  try {
    const { collections, words, journals } = data;
    await dbConnect();

    if (collections) {
      const collectionsWithoutId = collections.map((col) => {
        const { _id, ...others } = col;
        return { ...others };
      });
      // console.log(collections, collectionsWithoutId);

      const user = await User.findById(userId).select("collections");
      user.collections = collections;

      // console.log("new user", user);
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
