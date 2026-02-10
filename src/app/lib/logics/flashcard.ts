// models for dev
import wordsDev from "@/app/ModelsDev/UserWord";
// settings
import { FLASHCARD_QUIZ_ONE_TURN } from "../config/settings";
// methods
import { getRandomNumber } from "../helper";

export const getRandomWords = (totalNumberOfWords: number) => {
  //   If totalNumberOfWords is less than maxWordsOneTurn, set all words
  if (FLASHCARD_QUIZ_ONE_TURN > totalNumberOfWords) return wordsDev;

  const randomNumbersSet: Set<number> = new Set([]);

  //   until set gets 20 random numbers
  while (randomNumbersSet.size < FLASHCARD_QUIZ_ONE_TURN) {
    // minus 1 because it's gonna be used as an index and indexes are 0 base
    randomNumbersSet.add(getRandomNumber(0, totalNumberOfWords - 1));
  }

  const randomNumbersArray = Array.from(randomNumbersSet);

  //   get random words using random numbers as indexes
  const randomWords = randomNumbersArray.map((num) => wordsDev[num]);

  return randomWords;
};
