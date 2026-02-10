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

export type TYPE_DICTIONARY = {
  name: string;
  pronunciationString: string;
  pronunciationAudio: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
};

export type TYPE_WORD_BEFORE_SENT = {
  name: string;
  audio?: File | undefined;
  definitions: string[];
  examples: string[];
  imageName?: File | undefined;
  imageDefinitions?: File | undefined;
};

export type TYPE_WORD = {
  _id: string;
  userId: string;
  name: string;
  audio?: { name: string; buffer: ArrayBuffer } | undefined;
  definitions: string[];
  examples: string[];
  imageName?: { name: string; buffer: ArrayBuffer } | undefined;
  imageDefinitions?: { name: string; buffer: ArrayBuffer } | undefined;
  collectionId: string;
  status: number;
  nextReviewAt: string;
};

export type TYPE_WORD_TO_DISPLAY = {
  _id: string;
  userId: string;
  name: string;
  audio?: { name: string; data: string } | undefined;
  definitions: string[];
  examples: string[];
  imageName?: { name: string; data: string } | undefined;
  imageDefinitions?: { name: string; data: string } | undefined;
  collectionId: string;
  status: number;
  nextReviewAt: string;
};

export type TYPE_COLLECTIONS = {
  name: string;
  collectionId: string;
  numberOfWords: number;
};

export type TYPE_ACTION_PAGINATION = "add" | "reduce" | "reset";

export type TYPE_QUIZ_QUESTION = {
  sentence: string;
  name?: string;
  definitions?: string[];
  audio?: { name: string; data: string } | undefined;
  image: { name: string; data: string } | undefined;
};

export type TYPE_QUIZ_ANSWER = {
  name?: string;
  definitions?: string[];
  audio?: { name: string; data: string } | undefined;
  image: { name: string; data: string } | undefined;
};

export type TYPE_QUIZ_DATA = {
  question: TYPE_QUIZ_QUESTION;
  answer: TYPE_QUIZ_ANSWER;
  afterSentence: string;
  id: string;
  status: number;
};
