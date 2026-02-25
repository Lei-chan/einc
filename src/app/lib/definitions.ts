import * as z from "zod";
import {
  MIN_LENGTH_PASSWORD,
  MIN_NUMBER_EACH_PASSWORD,
} from "./config/settings";

export const SignupSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z
    .string()
    .min(MIN_LENGTH_PASSWORD, {
      error: `It should be at least ${MIN_LENGTH_PASSWORD} characters long.`,
    })
    .regex(/[a-z]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} lowercase letter.`,
    })
    .regex(/[A-Z]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} uppercase letter.`,
    })
    .regex(/[0-9]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} digit.`,
    })
    .trim()
    .optional(),
  isGoogleConnected: z.coerce.boolean(),
  collections: z.array(
    z.object({
      name: z.string().trim(),
      numberOfWords: z.number(),
      allWords: z.boolean().optional(),
    }),
  ),
});

export const updateEmailSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(MIN_LENGTH_PASSWORD, {
      error: `It should be at least ${MIN_LENGTH_PASSWORD} characters long.`,
    })
    .regex(/[a-z]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} lowercase letter.`,
    })
    .regex(/[A-Z]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} uppercase letter.`,
    })
    .regex(/[0-9]/, {
      error: `Please contain at least ${MIN_NUMBER_EACH_PASSWORD} digit.`,
    })
    .trim(),
});

export const WordSchema = z.object({
  userId: z.string(),
  collectionId: z.string(),
  name: z.string().trim().min(1),
  audio: z
    .object({ name: z.string().trim(), data: z.instanceof(ArrayBuffer) })
    .optional(),
  definitions: z.array(z.string().trim().min(1)),
  examples: z.array(z.string().trim()),
  imageName: z
    .object({ name: z.string().trim(), data: z.instanceof(ArrayBuffer) })
    .optional(),
  imageDefinitions: z
    .object({ name: z.string().trim(), data: z.instanceof(ArrayBuffer) })
    .optional(),
  status: z.number().gte(0).lte(5),
  nextReviewAt: z.iso.datetime(),
});

export const JournalSchema = z.object({
  userId: z.string(),
  collectionId: z.string(),
  journals: z.object({ date: z.iso.datetime(), content: z.array(z.string()) }),
});

export type FormStateAccount =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        isGoogleConnected?: string[];
        collections?: string[];
        curPassword?: string[];
        newPassword?: string[];
      };
      error?: { status?: number; message?: string };
      message?: string;
      data?: {
        email?: string;
      };
    }
  | undefined;

export type ErrorFormState =
  | { error?: { status?: number; message?: string } }
  | undefined;

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type FormStateCollection =
  | {
      errors?: {
        name?: string[];
      };
      error?: { status?: number; message?: string };
      message?: string;
    }
  | undefined;

export type FormStateWord =
  | {
      // errors?: {
      //   collectionId?: string[];
      //   name?: string[];
      //   definitions?: string[];
      // };
      error?: { status?: number; message?: string };
      message?: string;
    }
  | undefined;
