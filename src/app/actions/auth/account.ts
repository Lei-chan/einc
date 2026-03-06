"use server";
// next.js
import { redirect } from "next/navigation";
// database
import dbConnect from "@/app/lib/database";
import User from "@/app/lib/models/User";
import Word from "@/app/lib/models/Word";
import Journal from "@/app/lib/models/Journal";
// methods
import { verifySession } from "@/app/lib/dal";
import { deleteSession } from "@/app/lib/session";
import { getError } from "@/app/lib/errorHandler";
// types
import {
  FormStateAccount,
  updateEmailSchema,
  updatePasswordSchema,
} from "@/app/lib/definitions";
// library
import bcrypt from "bcrypt";

export async function updateEmail(
  formState: FormStateAccount,
  formData: FormData,
) {
  const { isAuth, userId } = await verifySession();
  try {
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
  const { isAuth, userId } = await verifySession();
  try {
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

export async function deleteAccount(formState: FormStateAccount, _: FormData) {
  const { isAuth, userId } = await verifySession();
  try {
    await dbConnect();
    await User.findByIdAndDelete(userId);
    await Word.deleteMany({ userId });
    await Journal.deleteMany({ userId });

    await deleteSession();
  } catch (err: unknown) {
    return getError("other", "", err);
  }

  // redirect to thank you page
  redirect("/account-closed");
}
