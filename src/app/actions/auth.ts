"use server";
import {
  FormState,
  SignupSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "../lib/definitions";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import User from "@/app/lib/models/User";
import { createSession, deleteSession } from "../lib/session";
import { getError } from "../lib/errorHandler";
import dbConnect from "../lib/database";
import { verifySession } from "../lib/dal";

export async function signupViaUserInfo(
  formState: FormState,
  formData: FormData,
) {
  try {
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
  formState: FormState,
  formData: FormData,
) {
  try {
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

export async function loginViaGoogle(formState: FormState, formData: FormData) {
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

export async function updateEmail(formState: FormState, formData: FormData) {
  try {
    const { isAuth, userId } = await verifySession();

    const email = formData.get("email");

    // validate email
    const validatedEmail = updateEmailSchema.safeParse(email);
    if (!validatedEmail.success)
      return getError("zodError", "", undefined, validatedEmail);

    // update user
    await dbConnect();
    const user = User.findByIdAndUpdate(
      userId,
      { email },
      { new: true },
    ).select("email");
    if (!user) return getError("notFound");

    return user;
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function updatePassword(formState: FormState, formData: FormData) {
  try {
    const { isAuth, userId } = await verifySession();

    const curPassword = String(formData.get("currentPassword")).trim() || "";
    const newPassword = String(formData.get("newPassword")) || "";

    // verify current password
    await dbConnect();
    const userPassword = await User.findById(userId).select("password");
    if (!userPassword) return getError("notFound");

    const isRightPassword = await bcrypt.compare(curPassword, userPassword);
    if (!isRightPassword) return getError("wrongPassword");

    // validate new password
    const validatedPassword = updatePasswordSchema.safeParse(newPassword);
    if (!validatedPassword.success)
      return getError("zodError", "", undefined, validatedPassword);

    // update password
    await User.findByIdAndUpdate(userId, { password: newPassword });

    return { message: "Password updated successfully!" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function deleteAccount(formState: FormState, formData: FormData) {
  try {
    const { isAuth, userId } = await verifySession();

    await dbConnect();
    await User.findByIdAndDelete(userId);
    await deleteSession();

    // redirect to thank you page
    redirect("/account-closed");
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
