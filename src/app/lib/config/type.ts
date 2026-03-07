import { Message } from "../definitions";

export type TYPE_DECODED_GOOGLE_CREDENTIAL = {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
};

export interface TYPE_ERROR extends Error {
  status?: number;
}

export interface TYPE_ERROR_WITH_ZOD_DATA extends Error {
  status?: number;
  zodErrorData:
    | { errors: { [key: string]: Message } }
    | { error: { status: number; message: Message } };
}

export type TYPE_MESSAGE = "pending" | "error" | "success";

export type TYPE_USER = {
  _id?: string;
  email: string;
  isGoogleConnected: boolean;
  collections: TYPE_COLLECTION[];
  createdAt?: string;
  updatedAt?: string;
};

export type TYPE_COLLECTION = {
  _id?: string;
  name: string;
  numberOfWords: number;
  allWords?: boolean;
};

export type TYPE_COLLECTIONS = TYPE_COLLECTION[];

export type TYPE_DICTIONARY = {
  name: string;
  pronunciationString: string;
  pronunciationAudio: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
};

export type MongoBuffer = { type: "Buffer"; data: number[] };

export type MediaDatabase = {
  name: string;
  buffer: Buffer | MongoBuffer;
} | null;

export type MediaToDisplay = { name: string; data: string } | null;

export type TYPE_WORD_BEFORE_SENT = {
  _id?: string;
  userId?: string;
  collectionId: string;
  name: string;
  audio: File | null;
  definitions: string;
  examples: string;
  imageName: File | null;
  imageDefinitions: File | null;
  status: number;
  nextReviewAt: string;
};

export type TYPE_WORD = {
  _id?: string;
  userId?: string;
  collectionId: string;
  name: string;
  audio: MediaDatabase;
  definitions: string[];
  examples: string[];
  imageName: MediaDatabase;
  imageDefinitions: MediaDatabase;
  status: number;
  nextReviewAt: string;
};

export type TYPE_WORD_TO_DISPLAY = {
  _id: string;
  userId: string;
  name: string;
  audio: MediaToDisplay;
  definitions: string[];
  examples: string[];
  imageName: MediaToDisplay;
  imageDefinitions: MediaToDisplay;
  collectionId: string;
  status: number;
  nextReviewAt: string;
};

export type TYPE_ACTION_PAGINATION = "add" | "reduce" | "reset";

export type TYPE_QUIZ_QUESTION = {
  sentence: Message;
  name?: string;
  definitions?: string[];
  audio?: MediaToDisplay;
  image: MediaToDisplay;
};

export type TYPE_QUIZ_ANSWER = {
  name?: string;
  definitions?: string[];
  audio?: MediaToDisplay;
  image: MediaToDisplay;
};

export type TYPE_QUIZ_DATA = {
  question: TYPE_QUIZ_QUESTION;
  answer: TYPE_QUIZ_ANSWER;
  afterSentence: string;
  id: string;
  status: number;
};

export type TYPE_JOURNAL_DATA_DATABASE = {
  //  MongoDB _id
  _id: string;
  userId?: string;
  collectionId: string;
  journal: TYPE_JOURNAL_DATA;
};

export type TYPE_JOURNAL_DATA = {
  date: Date | string;
  content: string[];
};

export type TYPE_DISPLAY_MESSAGE =
  | { type: TYPE_MESSAGE; message: string }
  | undefined;

export type Language = "en" | "ja";
