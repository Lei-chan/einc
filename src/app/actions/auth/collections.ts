"use server";
// database
import User from "@/app/lib/models/User";
import dbConnect from "../../lib/database";
// methods
import { verifySession } from "../../lib/dal";
import { getError } from "../../lib/errorHandler";
// types
import { FormStateCollection } from "../../lib/definitions";
import { TYPE_COLLECTION } from "@/app/lib/config/type";

export async function createCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const name = String(formData.get("name")).trim();
    if (!name) return { errors: { name: ["Name is required."] } };

    const { isAuth, userId } = await verifySession();

    await dbConnect();

    const user = await User.findById(userId).select("collections");
    user.collections.push({ name, numberOfWords: 0 });
    await user.save();

    return { message: `Collection ${name} created` };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function updateCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const formDataArr = [...formData];
    if (!formDataArr.length)
      return getError("other", "Please select at least one collection.");

    const validFormDataArr = [...formData].filter((dataArr) =>
      String(dataArr[1]).trim(),
    );

    if (!validFormDataArr.length)
      return getError("other", "Empty fields cannot be submitted.");

    const collectionIds = formDataArr.map((dataArr) => dataArr[0]);
    const names = formDataArr.map((dataArr) => String(dataArr[1]).trim());

    const { isAuth, userId } = await verifySession();

    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    const collectionsToModify = collectionIds.map((id) =>
      user.collections.find(
        (col: TYPE_COLLECTION) => col._id?.toString() === id,
      ),
    );

    collectionsToModify.forEach(
      (collection, i) => (collection.name = names[i]),
    );

    await user.save();

    return { message: "Collections updated" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function deleteCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const formDataArr = [...formData];
    if (!formDataArr.length)
      return getError("other", "Please select at least one collection.");

    const collectionIds = formDataArr.map((dataArr) => dataArr[0]);

    const { isAuth, userId } = await verifySession();

    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return getError("notFound");

    collectionIds.forEach((id) => user.collections.pull({ _id: id }));
    await user.save();

    return {
      message: `Collection${collectionIds.length === 1 ? "" : "s"} deleted`,
    };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
