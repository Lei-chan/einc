"use server";
import { FormState, SignupSchema } from "../lib/definitions";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import User from "@/app/lib/models/User";
import { createSession } from "../lib/session";
import { getError } from "../lib/errorHandler";
import dbConnect from "../lib/database";

export async function signupViaUserInfo(
  formState: FormState,
  formData: FormData,
) {
  try {
    console.log("signupViaUserInfo");

    const validatedFields = SignupSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      isGoogleConnected: false,
      collections: [],
    });

    if (!validatedFields.success)
      return { errors: validatedFields.error.flatten().fieldErrors };

    const { password, ...others } = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password as string, 10);

    await dbConnect();
    const user = await User.create({
      password: hashedPassword,
      others,
    });

    if (!user) return getError("notFound");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}

export async function signupViaGoogle(
  formState: FormState,
  formData: FormData,
) {
  try {
    console.log("signupViaGoogle");

    const validatedFields = SignupSchema.safeParse({
      email: formData.get("email"),
      isGoogleConnected: true,
      collections: [],
    });

    if (!validatedFields.success)
      return { errors: validatedFields.error.flatten().fieldErrors };

    await dbConnect();
    const user = await User.create(validatedFields.data);

    if (!user) return getError("notFound");

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}

export async function loginViaUserInfo(
  formState: FormState,
  formData: FormData,
) {
  try {
    console.log("loginViaUserInfo");
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password")).trim();

    if (!email && !password) return getError("bothBlank");
    if (!email) return getError("emailBlank");
    if (!password) return getError("passwordBlank");

    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) return getError("notFound");

    // verify password here

    await createSession(user._id);
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  redirect("/main");
}

export async function loginViaGoogle(formState: FormState, formData: FormData) {
  try {
    console.log("loginViaGoogle");

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
