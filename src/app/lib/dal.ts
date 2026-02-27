"use server";
import "server-only";
import { cookies } from "next/headers";
import { decrypt, deleteSession } from "./session";
import { cache } from "react";
import { redirect } from "next/navigation";
import User from "./models/User";
import { getError } from "./errorHandler";
import dbConnect from "./database";
import Word from "./models/Word";
import { isArray } from "chart.js/helpers";
import { TYPE_COLLECTION, TYPE_WORD } from "./config/type";
import { LISTS_ONE_PAGE } from "./config/settings";

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
    return getError("fetchFailed", "", err);
  }
});

export const getCollections = cache(async () => {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    const user = await User.findById(userId).select("collections");
    if (!user) return null;

    const userObject = JSON.parse(JSON.stringify(user));

    return userObject.collections;
  } catch (err: unknown) {
    console.error("Fetch failed", err);
    return null;
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

export const getUserWordsCollection = cache(async (collectionId: string) => {
  const allWords = await getUserWords();
  // if user doens't have any words, return []
  if (isArray(allWords) && !allWords.length) return [];
  if (!allWords) return null;

  // check if the collectionId is of the collection 'All', if so, return allWords
  const collections = await getCollections();
  if (!collections) return null;
  const isCollectionAll = collections.find(
    (col: TYPE_COLLECTION) => col.allWords && String(col._id) === collectionId,
  );
  if (isCollectionAll) return allWords;

  // otherwise return words in the collection
  const wordsForCollection = allWords.filter(
    (word: TYPE_WORD) => word.collectionId === collectionId,
  );
  return wordsForCollection;
});

export const getUserWordsStatuses = cache(async (collectionId: string) => {
  const wordsForCollection = await getUserWordsCollection(collectionId);
  // if no words, return []
  if (isArray(wordsForCollection) && !wordsForCollection.length) return [];
  if (!wordsForCollection) return null;

  const statuses = new Array(6).fill(0);
  wordsForCollection.forEach((word: TYPE_WORD) => (statuses[word.status] += 1));

  return statuses;
});

export const getMatchedWordsCurPage = cache(
  async (collectionId: string, value: string, curPage: number) => {
    const indexFrom = (curPage - 1) * LISTS_ONE_PAGE;
    const indexTo = indexFrom + LISTS_ONE_PAGE;

    const wordsForCollection = await getUserWordsCollection(collectionId);
    if (!wordsForCollection) return null;

    const matchedWords = value
      ? wordsForCollection.filter((word: TYPE_WORD) =>
          word.name.includes(value),
        )
      : wordsForCollection;

    // get only words that are needed to curPage
    const matchedWordsCurPage = matchedWords.slice(indexFrom, indexTo);

    return {
      numberOfMatchedWords: matchedWords.length,
      matchedWordsCurPage: matchedWordsCurPage,
    };
  },
);
