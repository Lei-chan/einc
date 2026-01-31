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
  name: string;
  audio?: { name: string; data: string } | undefined;
  definitions: string[];
  examples: string[];
  imageName?: { name: string; data: string } | undefined;
  imageDefinitions?: { name: string; data: string } | undefined;
};

export type TYPE_ACTION_PAGINATION = "add" | "reduce";
