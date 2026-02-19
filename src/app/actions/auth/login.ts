"use server";
// next.js
import { redirect } from "next/navigation";
// database
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
// methods
import { createSession } from "@/app/lib/session";
import { getError } from "@/app/lib/errorHandler";
// types
import { FormStateAccount } from "@/app/lib/definitions";
// library
import bcrypt from "bcrypt";

export async function loginViaUserInfo(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();

    if (!email && !password) return getError("bothBlank");
    if (!email) return getError("emailBlank");
    if (!password) return getError("passwordBlank");

    await dbConnect();
    const user = await User.findOne({ email }).select("password");
    if (!user) return getError("notFound");

    // verify password
    const isRightPassword = await bcrypt.compare(password, user.password);
    if (!isRightPassword) return getError("wrongPassword");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}

export async function loginViaGoogle(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const email = String(formData.get("email")).trim();

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return getError("notFound");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }
  redirect("/main");
}
