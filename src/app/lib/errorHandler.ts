// settings
import {
  MIN_LENGTH_PASSWORD,
  MIN_NUMBER_EACH_PASSWORD,
} from "./config/settings";
// types
import { TYPE_ERROR, TYPE_ERROR_WITH_ZOD_DATA } from "./config/type";
import { Message } from "./definitions";
// library
import z, { ZodSafeParseResult } from "zod";

export const isError = (err: unknown): err is TYPE_ERROR => {
  return err !== undefined;
};

export const isZodError = (err: unknown): err is TYPE_ERROR_WITH_ZOD_DATA => {
  return err !== undefined;
};

export const getError = (
  type:
    | "notFound"
    | "blank"
    | "zodError"
    | "wrongPassword"
    | "fetchFailed"
    | "other",
  customMessage?: Message,
  err?: unknown | undefined,
  // required for blank error
  fieldNames?: { en: string; ja: string }[] | undefined,
  zodValidationResult?: ZodSafeParseResult<object>,
) => {
  const unexpectedErrorMsg = {
    en: "Unexpected error occured",
    ja: "予期せぬエラーが発生しました",
  };

  if (type === "notFound") {
    console.error("User Not Found");
    return {
      error: {
        status: 404,
        message: customMessage || {
          en: "User Not Found",
          ja: "ユーザーが見つかりません",
        },
      },
    };
  }

  if (type === "blank" && fieldNames) return getBlankError(fieldNames);

  if (type === "zodError" && zodValidationResult?.error)
    return getZodError(zodValidationResult.error);

  if (type === "wrongPassword") {
    console.error("Unauthorized");
    return {
      error: {
        status: 401,
        message: customMessage || {
          en: "Unauthorized. Please enter correct password.",
          ja: "認証に失敗しました。正しいパスワードを入力してください。",
        },
      },
    };
  }

  if (type === "fetchFailed") {
    console.error("Failed to fetch", err);
    return {
      error: {
        status: 500,
        message: customMessage || {
          en: "Failed to fetch",
          ja: "データの受け取りに失敗しました",
        },
      },
    };
  }

  if (err && isError(err)) {
    console.error(customMessage?.en || unexpectedErrorMsg.en, err);

    return {
      error: {
        status: err.status || 500,
        message: customMessage || { en: err.message, ja: err.message },
      },
    };
  }

  console.error(customMessage?.en || unexpectedErrorMsg.en);
  return {
    error: {
      status: 500,
      message: customMessage || unexpectedErrorMsg,
    },
  };
};

const getBlankError = (
  fieldNames: { en: string; ja: string }[],
): { errors: { [key: string]: Message } } => {
  const fieldErrors: { [key: string]: Message } = {};
  fieldNames.forEach((name) => {
    fieldErrors[name.en] = {
      en: `${name.en.at(0)?.toUpperCase() + name.en.slice(1)} is required`,
      ja: `${name.ja}は必須項目です`,
    };
  });
  console.error(fieldErrors);

  return { errors: fieldErrors };
};

const getZodError = (
  zodValidationError: z.ZodError<object>,
): { errors: { [key: string]: Message } } => {
  const japaneseErrors: { [key: string]: string } = {
    email: "正しいメールアドレスを入力してください",
    password: `${MIN_LENGTH_PASSWORD}文字以上を使用し、大文字、小文字、数字をそれぞれ${MIN_NUMBER_EACH_PASSWORD}つ以上入れてください`,
    name: "単語は必須項目です",
    definitions: "最低一つ以上の意味を入力してください",
  };

  const fieldErrors = z.flattenError(zodValidationError).fieldErrors;

  const errorsWithJapanese: { [key: string]: { en: string; ja: string } } = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    errorsWithJapanese[key] = { en: value[0], ja: japaneseErrors[key] };
  }
  console.log(errorsWithJapanese);
  return { errors: errorsWithJapanese };
};
