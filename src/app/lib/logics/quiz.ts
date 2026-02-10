import { FLASHCARD_QUIZ_ONE_TURN } from "../config/settings";
import { TYPE_QUIZ_DATA, TYPE_WORD } from "../config/type";
import {
  getRandomNumber,
  getUserDev,
  getUserWordsDev,
  getWordDataToDisplay,
} from "../helper";

// I will connect it to server later
export const getWordsToReview = (accessToken: string, id: string) => {
  const user = getUserDev(accessToken);
  if (!user) throw new Error("User not found!");

  const userWords = getUserWordsDev(user._id, id);

  //   get words nextReviewAt time is now or before now
  const wordsToReview = userWords.filter(
    (word) => Date.now() - new Date(word.nextReviewAt).getTime() >= 0,
  );

  // get only words that are needed for one turn
  return wordsToReview.slice(0, FLASHCARD_QUIZ_ONE_TURN);
};

export const convertWordsToQuizData = (words: TYPE_WORD[]) => {
  const quizData = words.flatMap((word) => {
    const wordToDisplay = getWordDataToDisplay(word);

    const nameData = {
      name: wordToDisplay.name,
      audio: wordToDisplay.audio,
      image: wordToDisplay.imageName,
    };
    const definitionsData = {
      definitions: wordToDisplay.definitions,
      image: wordToDisplay.imageDefinitions,
    };
    const commonData = {
      // display just 2 examples
      afterSentence: wordToDisplay.examples.slice(0, 2).join("\n"),
      id: word._id,
      status: word.status,
    };

    const wordAnswerMeaning = {
      question: {
        sentence: "Please answer the meaning of this word.",
        ...nameData,
      },
      answer: definitionsData,
      ...commonData,
    };
    const wordAnsweringWord = {
      question: {
        sentence: "Please answer the word of this meaning",
        ...definitionsData,
      },
      answer: nameData,
      ...commonData,
    };

    return [wordAnswerMeaning, wordAnsweringWord];
  });

  return quizData;
};

export const getNextStatus = (currentStatus: number, isCorrect: boolean) => {
  if (isCorrect) return currentStatus === 5 ? 5 : currentStatus + 1;

  return currentStatus === 0 ? 0 : currentStatus - 1;
};

export const getNextReviewDate = (status: number) => {
  const datePlus = [0, 1, 3, 7, 14, 30];
  const datePlusMilliseconds = datePlus.map(
    (date) => date * 24 * 60 * 60 * 1000,
  );
  return new Date(Date.now() + datePlusMilliseconds[status]).toISOString();
};

export const updateStatusNextReviewDate = (
  accessToken: string,
  collectionId: string,
  wordId: string,
  isCorrect: boolean,
) => {
  // for dev
  const user = getUserDev(accessToken);
  if (!user) throw new Error("User not found!");
  const userWords = getUserWordsDev(user._id, collectionId);

  const word = userWords.find((word) => word._id === wordId);
  if (!word) return;

  const updatedWord = { ...word };
  const nextStatus = getNextStatus(updatedWord.status, isCorrect);
  updatedWord.status = nextStatus;
  updatedWord.nextReviewAt = getNextReviewDate(nextStatus);

  // update the word in database here
};

export const getNextQuizAndIndex = (
  prev: TYPE_QUIZ_DATA[],
  curQuizIndex: number,
) => {
  // get rid of current quiz from quiz
  const newQuiz = [...prev].toSpliced(curQuizIndex, 1);

  // new random index for next quiz
  const newQuizIndex = getRandomNumber(0, newQuiz.length - 1);

  return { newQuiz, newQuizIndex };
};
