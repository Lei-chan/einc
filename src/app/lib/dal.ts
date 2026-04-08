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

export async function logout(language: Language) {
  await deleteSession();
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
