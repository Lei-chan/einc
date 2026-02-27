import { TYPE_DISPLAY_MESSAGE } from "./type";

export const MIN_NUMBER_EACH_PASSWORD = 1;
export const MIN_LENGTH_PASSWORD = 8;
// use more than one lowercase letter, one uppercase letter, and one digit
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const LISTS_ONE_PAGE = 20;
export const FLASHCARD_QUIZ_ONE_TURN = 10;
export const MILLISECONDS_A_DAY = 24 * 60 * 60 * 1000;
export const GENERAL_ERROR_MSG_DATA: TYPE_DISPLAY_MESSAGE = {
  type: "error",
  message: "Error occured. Please try again this later 🙇‍♂️",
};
