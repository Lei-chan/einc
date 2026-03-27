export type DecodedGoogleCredential = {
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

export interface MyError extends Error {
  status?: number;
  code?: number;
}

export interface MyZodError extends Error {
  status?: number;
  zodErrorData:
    | { errors: { [key: string]: Message } }
    | { error: { status: number; message: Message } };
}

export type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

export type Language = "en" | "ja";

export type Message = Record<Language, string>;

export type MessageType = "pending" | "error" | "success";

export type DisplayMessage = { type: MessageType; message: string } | undefined;

export type UserData = {
  _id?: string;
  email: string;
  isGoogleConnected: boolean;
  collections: Collection[];
  createdAt?: string;
  updatedAt?: string;
};

export type Collection = {
  _id?: string;
  name: string;
  numberOfWords: number;
  allWords?: boolean;
};

export type Collections = Collection[];

export type DictionaryData = {
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

export type WordBeforeSent = {
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

export type WordData = {
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

export type WordToDisplay = {
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

export type ActionPaginationType = "add" | "reduce" | "reset";

export type QuizQuestion = {
  sentence: Message;
  name?: string;
  definitions?: string[];
  audio?: MediaToDisplay;
  image: MediaToDisplay;
};

export type QuizAnswer = {
  name?: string;
  definitions?: string[];
  audio?: MediaToDisplay;
  image: MediaToDisplay;
};

export type QuizData = {
  question: QuizQuestion;
  answer: QuizAnswer;
  afterSentence: string;
  id: string;
  status: number;
};

export type JournalDatabase = {
  //  MongoDB _id
  _id: string;
  userId?: string;
  collectionId: string;
  journal: JournalData;
};

export type JournalData = {
  date: Date | string;
  content: string[];
};

export type CheckedDataList = { _id: string; checked: boolean }[];

export type DefinitionsDataQuiz = { wordId: string; newDefinitions: string[] };

export type UpdateStatusReviewDateDataQuiz = {
  wordId: string;
  isCorrect: boolean;
};

export type SerializedPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};
