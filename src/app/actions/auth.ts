import { FormState, SignupSchema } from "../lib/definitions";
import { redirect, RedirectType } from "next/navigation";
import bcrypt from "bcrypt";
import User from "@/app/lib/api/models/User";
import { TYPE_ERROR } from "../lib/config/type";

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

    const user = await User.create({
      password: hashedPassword,
      others,
    });

    if (!user) return getError("notFound");

    return { message: "Success" };
  } catch (err: unknown) {
    return getError("other", err);
  }
  //   redirect("/main", RedirectType.replace);
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

    const user = await User.create(validatedFields.data);

    if (!user) return getError("notFound");

    return { message: "Success" };
  } catch (err: unknown) {
    return getError("other", err);
  }
  //   redirect("/main", RedirectType.replace);
}

const isError = (err: unknown): err is TYPE_ERROR => {
  return err !== undefined;
};

const getError = (type: "notFound" | "other", err?: unknown) => {
  if (type === "notFound")
    return {
      error: { status: 404, message: "User Not Found." },
    };

  if (err && isError(err))
    return {
      error: {
        status: err?.status || 500,
        message: err?.message || "Unexpected error occured.",
      },
    };

  return {
    error: {
      status: 500,
      message: "Unexpected error occured.",
    },
  };
};
