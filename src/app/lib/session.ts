"use server";
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload } from "./definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const setSessionCookie = async (session: string) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });
  } catch (err) {
    throw err;
  }
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (err) {
    console.error("Failed to verify session");
  }
}

export async function createSession(userId: string) {
  const session = await encrypt({ userId, expiresAt });
  await setSessionCookie(session);
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);
  if (!session || !payload) return null;

  await setSessionCookie(session);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
