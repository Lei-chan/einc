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

export type TYPE_ACTION_PAGINATION = "add" | "reduce";
