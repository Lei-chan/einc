"use server";
// database
import Word from "@/app/lib/models/Word";
import dbConnect from "@/app/lib/database";
// methods
import { verifySession } from "@/app/lib/dal";
import {
  convertWordDataToSendServer,
  getNextReviewDate,
} from "@/app/lib/helper";
import { getError, isError } from "@/app/lib/errorHandler";
// types
import { TYPE_WORD, TYPE_WORD_BEFORE_SENT } from "@/app/lib/config/type";
import {
  DefinitionsDataQuiz,
  FormStateWordJournal,
  UpdateStatusReviewDateDataQuiz,
  WordSchema,
} from "@/app/lib/definitions";

// const validateWord = (wordData: TYPE_WORD) => {
//   const result = WordSchema.safeParse(wordData);
//   if (result.success) return;

//   const fieldErrors = getError("prettyZodError", "", undefined, result);

//   const err = new Error(fieldErrors.error?.message);
//   err.name = "zodError";
//   throw err;
// };

export async function addWords(
  formState: FormStateWordJournal,
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
    wordDataToSendServer.forEach((data) => {
      const result = WordSchema.safeParse(data);
      if (!result.success) {
        const fieldErrors = getError("prettyZodError", "", undefined, result);
        const err = new Error(fieldErrors.error?.message || "");
        err.name = "zodError";
        throw err;
      }
    });

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
      "Error occured. Please try again this later 🙇‍♂️",
      err,
    );
  }
}

export async function updateWord(
  formState: FormStateWordJournal,
  wordData: TYPE_WORD_BEFORE_SENT,
) {
  const { isAuth, userId } = await verifySession();
  try {
    const wordDataWithUserId = { userId: String(userId), ...wordData };
    // separate _id and other properties to update (because _id cannot be modified)
    const { _id, ...others } =
      await convertWordDataToSendServer(wordDataWithUserId);

    // validate with zod validation
    const result = WordSchema.safeParse(wordData);
    if (!result.success)
      return getError("prettyZodError", "", undefined, result);

    await dbConnect();
    await Word.findByIdAndUpdate(_id, others);

    return { message: "Word updated successfully" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function deleteWords(
  formState: FormStateWordJournal,
  data: {
    collectionId: string;
    checkedData: { _id: string; checked: boolean }[];
  },
) {
  await verifySession();
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
  formState: FormStateWordJournal,
  data: DefinitionsDataQuiz,
) {
  await verifySession();
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

const getNextStatus = (currentStatus: number, isCorrect: boolean) => {
  if (isCorrect) return currentStatus === 5 ? 5 : currentStatus + 1;

  return currentStatus === 0 ? 0 : currentStatus - 1;
};

export async function updateStatusNextReviewDate(
  formState: FormStateWordJournal,
  data: UpdateStatusReviewDateDataQuiz,
) {
  await verifySession();
  try {
    await dbConnect();
    const word = await Word.findById(data.wordId);
    if (!word) return getError("notFound", "Word not found");

    const nextStatus = getNextStatus(word.status, data.isCorrect);
    word.status = nextStatus;
    word.nextReviewAt = getNextReviewDate(nextStatus);

    await word.save();

    return { message: "Status and review date updated successfully" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
