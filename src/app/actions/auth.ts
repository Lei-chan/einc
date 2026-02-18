"use server";
// next.js
import { redirect } from "next/navigation";
// mongoose
import User from "@/app/lib/models/User";
import dbConnect from "../lib/database";
// methods
import { createSession, deleteSession } from "../lib/session";
import { getCollections, verifySession } from "../lib/dal";
import { getError } from "../lib/errorHandler";
// types
import {
  FormStateAccount,
  FormStateCollection,
  SignupSchema,
  updateEmailSchema,
  updatePasswordSchema,
} from "../lib/definitions";
// libraries
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

export async function signupViaUserInfo(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const validatedFields = SignupSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      isGoogleConnected: false,
      collections: [{ name: "All", collectionId: nanoid(), numberOfWords: 0 }],
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
      collections: [{ name: "All", collectionId: nanoid(), numberOfWords: 0 }],
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

export async function updateEmail(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const { isAuth, userId } = await verifySession();

    const email = formData.get("email");

    // validate email
    const validationField = updateEmailSchema.safeParse({ email });
    if (!validationField.success)
      return getError("zodError", "", undefined, validationField);

    // update user
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      { email },
      { new: true },
    ).select("email");
    if (!user) return getError("notFound");

    const userEmail = JSON.parse(JSON.stringify(user)).email;

    return { data: { email: userEmail } };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function updatePassword(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const { isAuth, userId } = await verifySession();

    const curPassword = String(formData.get("currentPassword")).trim() || "";
    const newPassword = String(formData.get("newPassword")).trim() || "";

    // if curPassword or newPassword is falsy, return errors
    if (!curPassword || !newPassword)
      return {
        errors: {
          ...(!curPassword && {
            curPassword: ["Current password is required."],
          }),
          ...(!newPassword && { newPassword: ["New password is required."] }),
        },
      };

    // verify current password
    await dbConnect();
    const user = await User.findById(userId).select("password");
    if (!user) return getError("notFound");

    const isRightPassword = await bcrypt.compare(curPassword, user.password);
    if (!isRightPassword) return getError("wrongPassword");

    // validate new password
    const validationField = updatePasswordSchema.safeParse({
      password: newPassword,
    });

    if (!validationField.success)
      return getError("zodError", "", undefined, validationField);

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword as string, 10);

    // update password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    return { message: "Password updated successfully!" };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}

export async function deleteAccount(
  formState: FormStateAccount,
  formData: FormData,
) {
  try {
    const { isAuth, userId } = await verifySession();

    await dbConnect();
    await User.findByIdAndDelete(userId);
    await deleteSession();
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  // redirect to thank you page
  redirect("/account-closed");
}

export async function createCollection(
  formState: FormStateCollection,
  formData: FormData,
) {
  try {
    const name = String(formData.get("name")).trim();
    if (!name) return { errors: { name: ["Name is required."] } };

    const { isAuth, userId } = await verifySession();

    await dbConnect();

    const user = await User.findById(userId).select("collections");
    user.collections.push({ name, numberOfWords: 0 });
    await user.save();

    const newCollections = user.collections;
    console.log(newCollections);
    return { message: `Collection ${name} created` };
  } catch (err: unknown) {
    return getError("other", "", err);
  }
}
