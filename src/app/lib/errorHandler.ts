import { ZodSafeParseResult } from "zod";
import { TYPE_ERROR } from "./config/type";

const isError = (err: unknown): err is TYPE_ERROR => {
  return err !== undefined;
};

export const getError = (
  type:
    | "notFound"
    | "emailBlank"
    | "passwordBlank"
    | "bothBlank"
    | "zodError"
    | "wrongPassword"
    | "fetchFailed"
    | "other",
  customMessage?: string,
  err?: unknown | undefined,
  zodValidationResult?: ZodSafeParseResult<string>,
) => {
  const unexpectedErrorMsg = "Unexpected error occured";

  if (type === "notFound") {
    console.error("User Not Found");
    return {
      error: { status: 404, message: customMessage || "User Not Found." },
    };
  }

  const errorEmail = { email: ["Email is required."] };
  const errorPassword = { password: ["Password is required."] };

  if (type === "bothBlank")
    return { errors: { ...errorEmail, ...errorPassword } };

  if (type === "emailBlank") return { errors: errorEmail };

  if (type === "passwordBlank") return { errors: errorPassword };

  if (type === "zodError" && zodValidationResult)
    return { errors: zodValidationResult.error?.flatten()?.fieldErrors };

  if (type === "wrongPassword") {
    console.error("Unauthorized");
    return { error: { status: 401, message: customMessage || "Unauthorized" } };
  }

  if (type === "fetchFailed") {
    console.error("Failed to fetch", err);
    return {
      error: {
        status: 500,
        message: customMessage || "Failed to fetch",
      },
    };
  }

  if (err && isError(err)) {
    console.error(unexpectedErrorMsg);
    return {
      error: {
        status: err?.status || 500,
        message: customMessage || err?.message || unexpectedErrorMsg,
      },
    };
  }

  return {
    error: {
      status: 500,
      message: customMessage || unexpectedErrorMsg,
    },
  };
};
