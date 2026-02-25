"use server";
import "server-only";
import { cookies } from "next/headers";
import { decrypt, deleteSession } from "./session";
import { cache } from "react";
import { redirect } from "next/navigation";
import User from "./models/User";
import { getError } from "./errorHandler";
import dbConnect from "./database";

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  const userId = session?.userId;

  if (!userId) redirect("/login");

  return { isAuth: true, userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  try {
    await dbConnect();
    const user = await User.findById(session.userId);
    const userObject = JSON.parse(JSON.stringify(user));

    return userObject;
  } catch (err: unknown) {
    return getError("fetchFailed", "", err);
  }
});

export const getCollections = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const user = await User.findById(userId).select("collections");

    const userObject = JSON.parse(JSON.stringify(user));

    return userObject.collections;
  } catch (err: unknown) {
    return getError("fetchFailed", "", err);
  }
});

export const getCollectionDataCurPage = cache(
  async (indexFrom: number, indexTo: number) => {
    const collections = await getCollections();
    if (!collections) return null;

    const collectionsCurPage = collections.slice(indexFrom, indexTo);

    return {
      collections: collectionsCurPage,
      numberOfCollections: collections.length,
    };
  },
);

export async function logout() {
  await deleteSession();
  redirect("/");
}
