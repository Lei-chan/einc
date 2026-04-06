"use server";
// database
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
// methods
import { getError, isError } from "@/app/lib/errorHandler";
import { createSession } from "@/app/lib/session";
// zod schema
import { SignupSchema } from "@/app/lib/zodSchemas";
// types
import { FormStateAccount } from "@/app/lib/config/types/formState";
import { Language } from "@/app/lib/config/types/others";
// library
import bcrypt from "bcrypt";
import { createIndexedDBDatabase } from "@/app/lib/indexedDB/create";

export async function signupViaUserInfo(
  formState: FormStateAccount,
  data: { formData: FormData; language: Language },
) {
  try {
    const result = SignupSchema.safeParse({
      email: data.formData.get("email"),
      password: data.formData.get("password"),
      isGoogleConnected: false,
      collections: [
        { name: data.language === "en" ? "All" : "全て", allWords: true },
      ],
    });

    if (!result.success)
      return getError("zodError", undefined, undefined, undefined, result);

    const { password, ...others } = result.data;

    const hashedPassword = await bcrypt.hash(password as string, 10);

    await dbConnect();
    const user = await User.create({
      password: hashedPassword,
      ...others,
    });
    if (!user) return getError("notFound");

    await createSession(user._id);

    // Create database in indexedDB
    await createIndexedDBDatabase();

    return {
      message: {
        en: "User signed up successfully",
        ja: "ユーザーの登録に成功しました",
      },
    };
  } catch (err: unknown) {
    // mongoDB duplicate error
    if (isError(err) && err.code === 11000) return getError("emailDuplicate");

    return getError("other", undefined, err);
  }
}

export async function signupViaGoogle(
  formState: FormStateAccount,
  data: { email: string; language: Language },
) {
  try {
    const result = SignupSchema.safeParse({
      email: data.email.trim(),
      isGoogleConnected: true,
      collections: [
        { name: data.language === "en" ? "All" : "全て", allWords: true },
      ],
    });

    if (!result.success)
      return getError("zodError", undefined, undefined, undefined, result);

    await dbConnect();
    const user = await User.create(result.data);
    if (!user) return getError("notFound");

    await createSession(user._id);

    // Create indexedDB database
    await createIndexedDBDatabase();

    return {
      message: {
        en: "User signed up successfully",
        ja: "ユーザーの登録に成功しました",
      },
    };
  } catch (err: unknown) {
    // mongoDB duplicate error
    if (isError(err) && err.code === 11000) return getError("emailDuplicate");

    return getError("other", undefined, err);
  }
}
