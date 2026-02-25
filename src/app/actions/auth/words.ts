"use server";
import { TYPE_COLLECTION } from "@/app/lib/config/type";
import { verifySession } from "@/app/lib/dal";
import dbConnect from "@/app/lib/database";
import { FormStateWord, WordSchema } from "@/app/lib/definitions";
import { getError, isError } from "@/app/lib/errorHandler";
import { convertWordDataToSendServer } from "@/app/lib/helper";
import { getNextReviewDate } from "@/app/lib/logics/quiz";
import User from "@/app/lib/models/User";
import Word from "@/app/lib/models/Word";

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

    console.log(lastWordIndex);

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
    wordDataToSendServer.forEach((data) => {
      const result = WordSchema.safeParse(data);
      if (!result.success) {
        const fieldErrors = getError("zodError", "", undefined, result) as {
          errors: {
            name?: string[];
            definitions?: string[];
            collectionId?: string[];
          };
        };

        const nameError = fieldErrors.errors?.name
          ? "Word name is required"
          : "";
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
      }
    });

    await dbConnect();
    // const createWords = await Promise.all(
    //   wordDataToSendServer.map((data) => Word.create(data)),
    // );

    // console.log(createWords);

    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    const collectionIds = wordDataToSendServer.map((data) => data.collectionId);
    const uniqueWordCollectionIds = new Set(collectionIds);
    console.log(uniqueWordCollectionIds);

    // collectionIds.forEach(id => )
    // add collection numberOfWord next!

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
