"use client";
import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
import { TYPE_WORD_TO_DISPLAY } from "@/app/lib/config/type";
import {
  getUserDev,
  getUserWordsDev,
  getWordDataToDisplay,
} from "@/app/lib/helper";
import { paginationReducer } from "@/app/lib/reducers";
import { use, useEffect, useReducer, useState } from "react";

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const id = use(params);
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [wordsAnswerMeaning, setWordsAnswerMeaning] = useState<
    TYPE_WORD_TO_DISPLAY[]
  >([]);
  const [wordsAnswerWord, setWordsAnswerWord] = useState<
    TYPE_WORD_TO_DISPLAY[]
  >([]);
  const [curQuestion, dispatch] = useReducer(paginationReducer, 1);

  //   For dev
  const accessToken = "iiii";

  // I will connect it to server with await later!
  const getWordsForQuiz = async () => {
    try {
      const user = getUserDev(accessToken);
      if (!user) throw new Error("User not found!");

      const userWords = getUserWordsDev(user._id);
      //   get words nextReviewAt time is now or before now for one turn
      const wordsToReview = userWords
        .filter(
          (word) => Date.now() - new Date(word.nextReviewAt).getTime() >= 0,
        )
        .slice(0, FLASHCARD_QUIZ_ONE_TURN);
      const wordsToDisplay = wordsToReview.map((word) =>
        getWordDataToDisplay(word),
      );

      //   times 2 because there're questions for both meanings and for words
      setNumberOfQuestions(wordsToDisplay.length * 2);
      setWordsAnswerMeaning(wordsToDisplay);
      setWordsAnswerWord(wordsToDisplay);
    } catch (err: unknown) {
      console.error("Error", err);
    }
  };

  useEffect(() => {
    (async () => await getWordsForQuiz())();
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    dispatch("add");
  }

  return (
    <div className="w-screen h-screen">
      <p className="absolute top-2 right-3">
        {curQuestion} / {numberOfQuestions}
      </p>
      <form onSubmit={handleSubmit}></form>
    </div>
  );
}
