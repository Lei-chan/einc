import "server-only";
import { cookies } from "next/headers";
import { decrypt } from "./session";
import { cache } from "react";
import { redirect } from "next/navigation";
import User from "./models/User";
import { getError } from "./errorHandler";

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
    const user = await User.findById(session.userId);

    return user;
  } catch (err: unknown) {
    console.error("Error. Failed to fetch.");
    return null;
  }
});

export const getCollectionDataCurPage = cache(
  async (indexFrom: number, indexTo: number) => {
    const user = await getUser();
    if (!user) return null;

    const collections = user.collections;
    const collectionsCurPage = collections.slice(indexFrom, indexTo);

    return {
      collections: collectionsCurPage,
      numberOfCollections: collections.length,
    };
  },
);
