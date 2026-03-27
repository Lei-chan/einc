import { Message } from "./others";

export type FormStateAccount =
  | {
      errors?: {
        email?: Message;
        password?: Message;
        isGoogleConnected?: Message;
        collections?: Message;
        curPassword?: Message;
        newPassword?: Message;
      };
      error?: { status?: number; message?: Message };
      message?: Message;
      data?: {
        email?: string;
      };
    }
  | undefined;

export type ErrorFormState =
  | {
      error?: { status?: number; message?: Message };
      errors?: { [key: string]: Message };
    }
  | undefined;

export type FormStateCollection =
  | {
      errors?: {
        name?: Message;
      };
      error?: { status?: number; message?: Message };
      message?: Message;
    }
  | undefined;

export type FormStateWordJournal =
  | {
      error?: { status?: number; message?: Message };
      errors?: { [key: string]: Message };
      message?: Message;
    }
  | undefined;

export type FormStateSubscription =
  | {
      error?: { status?: number; message?: Message };
      success?: boolean;
    }
  | undefined;
