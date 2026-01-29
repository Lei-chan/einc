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
  pronunciationAudio?: string;
  definitions: string[];
  examples: string[];
  imageName?: string;
  imageDefinitions?: string;
};

export type TYPE_ACTION_PAGINATION = "add" | "reduce";
