"use server";
// database
import User from "@/app/lib/models/User";
import dbConnect from "../../lib/database";
// methods
import { verifySession } from "../../lib/dal";
import { getError } from "../../lib/errorHandler";
// types
import { FormStateCollection } from "../../lib/config/types/formState";
import { Collection } from "@/app/lib/config/types/others";

export async function createCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const name = String(formData.get("name")).trim();
    if (!name)
      return getError("blank", undefined, undefined, [
        { en: "Name", ja: "名前" },
      ]);

    const { isAuth, userId } = await verifySession();

    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    user.collections.push({ name, numberOfWords: 0 });
    await user.save();

    return {
      message: {
        en: `Collection ${name} created`,
        ja: `コレクション${name}が作成されました`,
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}

export async function updateCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const formDataArr = [...formData];
    if (!formDataArr.length)
      return getError("other", {
        en: "Please select at least one collection.",
        ja: "最低一つ以上のコレクションを選択してください",
      });

    const validFormDataArr = [...formData].filter((dataArr) =>
      String(dataArr[1]).trim(),
    );

    if (!validFormDataArr.length)
      return getError("other", {
        en: "Empty fields cannot be submitted.",
        ja: "空欄の項目は送信できません",
      });

    const collectionIds = formDataArr.map((dataArr) => dataArr[0]);
    const names = formDataArr.map((dataArr) => String(dataArr[1]).trim());

    const { isAuth, userId } = await verifySession();

    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    const collectionsToModify = collectionIds.map((id) =>
      user.collections.find((col: Collection) => col._id?.toString() === id),
    );

    collectionsToModify.forEach(
      (collection, i) => (collection.name = names[i]),
    );

    await user.save();

    return {
      message: {
        en: "Collections updated",
        ja: "コレクションが更新されました",
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}

export async function deleteCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const formDataArr = [...formData];
    if (!formDataArr.length)
      return getError("other", {
        en: "Please select at least one collection.",
        ja: "最低一つ以上のコレクションを選択してください",
      });

    const collectionIds = formDataArr.map((dataArr) => dataArr[0]);

    const { isAuth, userId } = await verifySession();

    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    collectionIds.forEach((id) => user.collections.pull({ _id: id }));
    await user.save();

    return {
      message: {
        en: `Collection${collectionIds.length === 1 ? "" : "s"} deleted`,
        ja: "コレクションが削除されました",
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}
