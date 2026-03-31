export const MIN_NUMBER_EACH_PASSWORD = 1;
export const MIN_LENGTH_PASSWORD = 8;
// use more than one lowercase letter, one uppercase letter, and one digit
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const LISTS_ONE_PAGE = 20;
export const FLASHCARD_QUIZ_ONE_TURN = 10;
export const MILLISECONDS_A_DAY = 24 * 60 * 60 * 1000;

// links
export const BASE_URL = "https://einc.lei-chan.website";
export const API_ALLOWED_ORIGIN =
  "https://management.lei-chan.website/einc/send-notification/";
export const GITHUB_LINK = "https://github.com/Lei-chan";
export const INSTAGRAM_LINK =
  "https://www.instagram.com/leichanweb?igsh=NzJmb3Axc3ZvNWN6&utm_source=qr";

// metadata
export const APP_NAME = "einc -Vocab Memorizing App-";
export const APP_DESCRIPTION =
  "einc is here for you to help you remember words and exppressions more efficiently!";
export const METADATA_BASE = new URL(BASE_URL);
