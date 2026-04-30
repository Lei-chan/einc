export const MIN_NUMBER_EACH_PASSWORD = 1;
export const MIN_LENGTH_PASSWORD = 8;
// use more than one lowercase letter, one uppercase letter, and one digit
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const LISTS_ONE_PAGE = 20;
export const FLASHCARD_QUIZ_ONE_TURN = 10;
// for now
export const DICTIONARY_LANGUAGES = ["ja", "en"];
export const DICTIONARY_LANGUAGES_FOR_MULTILANGUAGES = [
  {
    language: "ja",
    languageForMultiLanguage: { en: "Japanese", ja: "日本語" },
  },
  { language: "en", languageForMultiLanguage: { en: "English", ja: "英語" } },
];
export const DICTIONARY_ONE_PAGE = 10;
export const MILLISECONDS_A_DAY = 24 * 60 * 60 * 1000;

// links
export const BASE_URL = "https://einc.lei-chan.website";
export const API_ALLOWED_ORIGIN = "https://management.lei-chan.website";
export const GITHUB_LINK = "https://github.com/Lei-chan";
export const INSTAGRAM_LINK =
  "https://www.instagram.com/leichanweb?igsh=NzJmb3Axc3ZvNWN6&utm_source=qr";

// metadata
export const APP_NAME = "einc - Vocabulary Memorization App -";
export const APP_DESCRIPTION =
  "This web app helps you memorize vocabulary through features like registering words or expressions, studying them with flashcards or quizzes (offline supported), reinforcing them by writing your own journal entries.";
export const METADATA_BASE = new URL(BASE_URL);
