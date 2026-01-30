export type TYPE_DICTIONARY = {
  name: string;
  pronunciationString: string;
  pronunciationAudio: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
};

export type TYPE_WORD = {
  name: string;
  audio?: string;
  definitions: string[];
  examples: string[];
  imageName?: { name: string; data: string };
  imageDefinitions?: { name: string; data: string };
};

export type TYPE_ACTION_PAGINATION = "add" | "reduce";
