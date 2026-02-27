"use server";
import {
  TYPE_COLLECTIONS,
  TYPE_WORD,
  TYPE_WORD_BEFORE_SENT,
} from "@/app/lib/config/type";
import { verifySession } from "@/app/lib/dal";
import dbConnect from "@/app/lib/database";
import { FormStateWord, WordSchema } from "@/app/lib/definitions";
import { getError, isError } from "@/app/lib/errorHandler";
import { convertWordDataToSendServer } from "@/app/lib/helper";
import { getNextReviewDate } from "@/app/lib/logics/quiz";
import User from "@/app/lib/models/User";
import Word from "@/app/lib/models/Word";

const validateWord = (wordData: TYPE_WORD) => {
  const result = WordSchema.safeParse(wordData);
  if (result.success) return;

  const fieldErrors = getError("zodError", "", undefined, result) as {
    errors: {
      name?: string[];
      definitions?: string[];
      collectionId?: string[];
    };
  };

  const nameError = fieldErrors.errors?.name ? "Word name is required" : "";
  const definitionsError = fieldErrors.errors.definitions
    ? "Definitions are required"
    : "";
  const collectionIdError = fieldErrors.errors.collectionId
    ? "Collection id is required"
    : "";

  const errors = [nameError, definitionsError, collectionIdError].filter(
    (err) => err,
  );
  const err = new Error(errors.join(", "));
  err.name = "zodError";
  throw err;
};

export async function addWords(formState: FormStateWord, formData: FormData) {
  const { isAuth, userId } = await verifySession();
  try {
    const formDataArr = [...formData];
    if (!formDataArr.length)
      return getError("other", "At least one word is required.");

    // get a property key of  the last element
    const lastElementProperty = String(formDataArr.at(-1)?.at(0));
    // take the last letter(index) that is put on the key
    const lastWordIndex = Number(lastElementProperty.at(-1));

    // Add 1 to index because index is 0 base
    const emptyArrToSetWords = new Array(lastWordIndex + 1).fill("");

    const commonData = {
      userId: String(userId),
      status: 0,
      nextReviewAt: getNextReviewDate(0),
    };

    const addedWords = emptyArrToSetWords.map((_, i) => {
      return {
        collectionId: String(formData.get(`collection ${i}`) || ""),
        name: String(formData.get(`name ${i}`) || ""),
        audio: formData.get(`audio ${i}`) as File,
        definitions: String(formData.get(`definitions ${i}`) || ""),
        examples: String(formData.get(`examples ${i}`) || ""),
        imageName: formData.get(`imageName ${i}`) as File,
        imageDefinitions: formData.get(`imageDefinitions ${i}`) as File,
        ...commonData,
      };
    });

    const wordDataToSendServer = await Promise.all(
      addedWords.map((word) => convertWordDataToSendServer(word)),
    );

    // check if each data meets zod requirements
    wordDataToSendServer.forEach((data) => validateWord(data));

    await dbConnect();
    // create words
    await Promise.all(wordDataToSendServer.map((data) => Word.create(data)));

    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");
    const collections: TYPE_COLLECTIONS = user.collections;

    // get all collection ids
    const collectionIds = wordDataToSendServer.map((data) => data.collectionId);

    // add the number of words added to each collection numberOfWords
    collectionIds.forEach((id) => {
      // add 1 to the collection which a new word is added if the selected collection was not the collection 'All'
      const collection = collections.find(
        (col) => !col.allWords && String(col._id) === id,
      );
      if (collection) collection.numberOfWords += 1;

      // add 1 to the collection 'All'
      const collectionAll = collections.find((col) => col.allWords);
      if (collectionAll) collectionAll.numberOfWords += 1;
    });

    await user.save();

    return {
      message: `Word${lastWordIndex + 1 === 1 ? "" : "s"} created successfully`,
    };
  } catch (err: unknown) {
    if (isError(err) && err.name === "zodError")
      return getError("other", "", err);

    return getError(
      "other",
      "Error occured.  Please try again this later 🙇‍♂️",
      err,
    );
  }
}

export async function updateWord(
  formState: FormStateWord,
  wordData: TYPE_WORD_BEFORE_SENT,
) {
  const { isAuth, userId } = await verifySession();
  try {
    const wordDataWithUserId = { userId: String(userId), ...wordData };
    // separate _id and other properties to update (because _id cannot be modified)
    const { _id, ...others } =
      await convertWordDataToSendServer(wordDataWithUserId);

    // validate with zod validation
    validateWord(others);

    await dbConnect();
    await Word.findByIdAndUpdate(_id, others);

    return { message: "Word updated successfully" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function deleteWords(
  formState: FormStateWord,
  formData: FormData,
) {
  try {
    console.log([...formData]);
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
