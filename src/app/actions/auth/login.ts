"use server";
// database
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
// methods
import { createSession } from "@/app/lib/session";
import { getError } from "@/app/lib/errorHandler";
// types
import { FormStateAccount } from "@/app/lib/config/types/formState";
import { Language } from "@/app/lib/config/types/others";
// library
import bcrypt from "bcrypt";

export async function loginViaUserInfo(
  formState: FormStateAccount,
  data: { formData: FormData; language: Language },
) {
  try {
    const email = String(data.formData.get("email")).trim();
    const password = String(data.formData.get("password")).trim();

    // if email or password is falsy, return errors
    const emailName = { en: "email", ja: "メールアドレス" };
    const passwordName = { en: "password", ja: "パスワード" };

    if (!email && !password)
      return getError("blank", undefined, undefined, [emailName, passwordName]);
    if (!email) return getError("blank", undefined, undefined, [emailName]);
    if (!password)
      return getError("blank", undefined, undefined, [passwordName]);

    await dbConnect();
    const user = await User.findOne({ email }).select("password");
    if (!user) return getError("notFound");

    // verify password
    const isRightPassword = await bcrypt.compare(password, user.password);
    if (!isRightPassword) return getError("wrongPassword");

    await createSession(user._id);

    return {
      message: {
        en: "User logged in successfully",
        ja: "ユーザーのログインに成功しました",
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}

export async function loginViaGoogle(
  formState: FormStateAccount,
  data: { email: string; language: Language },
) {
  try {
    await dbConnect();
    const user = await User.findOne({ email: data.email.trim() });
    if (!user) return getError("notFound");

    await createSession(user._id);

    return {
      message: {
        en: "User logged in successfully",
        ja: "ユーザーのログインに成功しました",
      },
    };
  } catch (err: unknown) {
    return getError("other", undefined, err);
  }
}
