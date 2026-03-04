"use server";
// database
import Word from "@/app/lib/models/Word";
import dbConnect from "@/app/lib/database";
// methods
import { verifySession } from "@/app/lib/dal";
import { convertWordDataToSendServer } from "@/app/lib/helper";
import { getError, isError } from "@/app/lib/errorHandler";
// types
import { TYPE_WORD, TYPE_WORD_BEFORE_SENT } from "@/app/lib/config/type";
import {
  DefinitionsDataQuiz,
  FormStateWord,
  WordSchema,
} from "@/app/lib/definitions";

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

export async function addWords(
  formState: FormStateWord,
  wordData: TYPE_WORD_BEFORE_SENT[],
) {
  const { isAuth, userId } = await verifySession();
  try {
    const wordDataToSendServer = await Promise.all(
      wordData.map((word) =>
        convertWordDataToSendServer({ ...word, userId: String(userId) }),
      ),
    );

    // check if each data meets zod requirements
    wordDataToSendServer.forEach((data) => validateWord(data));

    await dbConnect();
    // create words
    await Promise.all(wordDataToSendServer.map((data) => Word.create(data)));

    return {
      message: `Word created successfully`,
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
  data: {
    collectionId: string;
    checkedData: { _id: string; checked: boolean }[];
  },
) {
  const { isAuth, userId } = await verifySession();
  try {
    // only take checked word data
    const wordsToDelete = data.checkedData.filter((data) => data.checked);

    if (!wordsToDelete.length) return;

    // delete words using Promise.all
    await dbConnect();
    await Promise.all(
      wordsToDelete.map((word) => Word.findByIdAndDelete(word._id)),
    );

    return {
      message: `Word${wordsToDelete.length === 1 ? "" : "s"} deleted successfully`,
    };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function addDefinitions(
  formState: FormStateWord,
  data: DefinitionsDataQuiz,
) {
  try {
    await dbConnect();
    const word = await Word.findById(data.wordId).select("definitions");
    if (!word) return getError("notFound", "Word not found");

    data.newDefinitions.forEach((def) => word.definitions.push(def));

    await word.save();

    return {
      message: `New definition${data.newDefinitions.length === 1 ? "" : "s"} added successfully`,
    };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
