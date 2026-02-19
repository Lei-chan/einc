"use server";
// next.js
import { redirect } from "next/navigation";
// database
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
// methods
import { getError } from "@/app/lib/errorHandler";
import { createSession } from "@/app/lib/session";
// types
import { FormStateAccount, SignupSchema } from "@/app/lib/definitions";
// library
import bcrypt from "bcrypt";

export async function signupViaUserInfo(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const validatedFields = SignupSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      isGoogleConnected: false,
      collections: [{ name: "All", numberOfWords: 0 }],
    });

    if (!validatedFields.success)
      return getError("zodError", "", undefined, validatedFields);

    const { password, ...others } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password as string, 10);

    await dbConnect();
    const user = await User.create({
      password: hashedPassword,
      ...others,
    });
    if (!user) return getError("notFound");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}

export async function signupViaGoogle(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const validatedFields = SignupSchema.safeParse({
      email: formData.get("email"),
      isGoogleConnected: true,
      collections: [{ name: "All", numberOfWords: 0 }],
    });

    if (!validatedFields.success)
      return getError("zodError", "", undefined, validatedFields);

    await dbConnect();
    const user = await User.create(validatedFields.data);

    if (!user) return getError("notFound");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}
