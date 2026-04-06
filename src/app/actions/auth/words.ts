"use server";
// database
import Word from "@/app/lib/models/Word";
import dbConnect from "@/app/lib/database";
// methods
import { verifySession } from "@/app/lib/dal";
import { convertWordDataToSendServer } from "@/app/lib/helper";
import { getError, isZodError } from "@/app/lib/errorHandler";
// zod schema
import { WordSchema } from "@/app/lib/zodSchemas";
// types
import { MyZodError, WordBeforeSent } from "@/app/lib/config/types/others";
import { FormStateWordJournal } from "@/app/lib/config/types/formState";

export async function addWords(
  formState: FormStateWordJournal,
  wordData: WordBeforeSent[],
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
        const fieldErrors = getError(
          "zodError",
          undefined,
          undefined,
          undefined,
          result,
        );
        const err = new Error("") as MyZodError;
        err.name = "zodError";
        err.zodErrorData = fieldErrors;
        throw err;
      }
    });

    await dbConnect();
    // create words
    await Promise.all(wordDataToSendServer.map((data) => Word.create(data)));

    return {
      message: { en: `Word created successfully`, ja: "単語が作成されました" },
    };
  } catch (err: unknown) {
    if (isZodError(err) && err.name === "zodError" && err.zodErrorData)
      return err.zodErrorData;

    return getError("other", undefined, err);
  }
}

export async function updateWord(
  formState: FormStateWordJournal,
  wordData: WordBeforeSent,
) {
  const { isAuth, userId } = await verifySession();
  try {
    const wordDataWithUserId = { userId: String(userId), ...wordData };

    // separate _id and other properties to update (because _id cannot be modified)
    const { _id, ...others } =
      await convertWordDataToSendServer(wordDataWithUserId);

    // validate with zod validation
    const result = WordSchema.safeParse(others);
    if (!result.success)
      return getError("zodError", undefined, undefined, undefined, result);

    await dbConnect();
    await Word.findByIdAndUpdate(_id, others);

    return {
      message: { en: "Word updated successfully", ja: "単語が更新されました" },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
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
      message: {
        en: `Word${wordsToDelete.length === 1 ? "" : "s"} deleted successfully`,
        ja: "単語が削除されました",
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}

// export async function addDefinitions(
//   formState: FormStateWordJournal,
//   data: DefinitionsDataQuiz,
// ) {
//   await verifySession();
//   try {
//     await dbConnect();
//     const word = await Word.findById(data.wordId).select("definitions");
//     if (!word)
//       return getError("notFound", {
//         en: "Word not found",
//         ja: "単語が見つかりません",
//       });

//     data.newDefinitions.forEach((def) => word.definitions.push(def));

//     await word.save();

//     return {
//       message: {
//         en: `New definition${data.newDefinitions.length === 1 ? "" : "s"} added successfully`,
//         ja: "新しい意味が追加されました",
//       },
//     };
//   } catch (err: unknown) {
//     return getError("other", undefined, err);
//   }
// }

const getNextStatus = (currentStatus: number, isCorrect: boolean) => {
  if (isCorrect) return currentStatus === 5 ? 5 : currentStatus + 1;

  return currentStatus === 0 ? 0 : currentStatus - 1;
};

// export async function updateStatusNextReviewDate(
//   formState: FormStateWordJournal,
//   data: UpdateStatusReviewDateDataQuiz,
// ) {
//   await verifySession();
//   try {
//     await dbConnect();
//     const word = await Word.findById(data.wordId);
//     if (!word)
//       return getError("notFound", {
//         en: "Word not found",
//         ja: "単語が見つかりません",
//       });

//     const nextStatus = getNextStatus(word.status, data.isCorrect);
//     word.status = nextStatus;
//     word.nextReviewAt = getNextReviewDate(nextStatus);

//     await word.save();

//     return {
//       message: {
//         en: "Status and review date updated successfully",
//         ja: "Statusとreview dateが更新されました",
//       },
//     };
//   } catch (err: unknown) {
//     return getError("other", undefined, err);
//   }
// }
