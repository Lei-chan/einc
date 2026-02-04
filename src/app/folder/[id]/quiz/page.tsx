"use client";
// react
import { use, useEffect, useReducer, useState } from "react";
// reducers
import { paginationReducer } from "@/app/lib/reducers";
// settings
import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
// methods
import {
  getRandomNumber,
  getUserDev,
  getUserWordsDev,
  getWordDataToDisplay,
} from "@/app/lib/helper";
// types
import {
  TYPE_ACTION_PAGINATION,
  TYPE_QUIZ_ANSWER,
  TYPE_QUIZ_DATA,
  TYPE_QUIZ_QUESTION,
  TYPE_WORD,
} from "@/app/lib/config/type";
import Image from "next/image";
import ButtonAudio from "@/app/Components/ButtonAudio";

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [numberOfQuiz, setNumberOfQuiz] = useState(0);
  const [quiz, setQuiz] = useState<TYPE_QUIZ_DATA[]>([]);
  const [curQuiz, setCurQuiz] = useState<TYPE_QUIZ_DATA>();
  const [curQuizPage, dispatch] = useReducer(paginationReducer, 1);

  //   For dev
  const accessToken = "iiii";

  const convertWordsToQuizData = (words: TYPE_WORD[]) => {
    const quizData = words.flatMap((word) => {
      const wordToDisplay = getWordDataToDisplay(word);

      const nameData = {
        name: wordToDisplay.name,
        audio: wordToDisplay.audio,
        image: wordToDisplay.imageName,
      };
      const definitionsData = {
        definitions: wordToDisplay.definitions.join("\n"),
        image: wordToDisplay.imageDefinitions,
      };
      const commonData = {
        afterSentence: wordToDisplay.examples.join("\n"),
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

  // I will connect it to server with await later!
  const getWordsForQuiz = async () => {
    try {
      const user = getUserDev(accessToken);
      if (!user) throw new Error("User not found!");

      const userWords = getUserWordsDev(user._id, id);
      //   get words nextReviewAt time is now or before now for one turn
      const wordsToReview = userWords
        .filter(
          (word) => Date.now() - new Date(word.nextReviewAt).getTime() >= 0,
        )
        .slice(0, FLASHCARD_QUIZ_ONE_TURN);

      const quizData = convertWordsToQuizData(wordsToReview);
      setQuiz(quizData);

      const numOfQuiz = quizData.length;
      setNumberOfQuiz(numOfQuiz);

      const randomIndex = getRandomNumber(0, numberOfQuiz);

      setCurQuiz(quizData[randomIndex]);
    } catch (err: unknown) {
      console.error("Error", err);
    }
  };

  useEffect(() => {
    (async () => await getWordsForQuiz())();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <p className="absolute top-2 right-3">
        {curQuizPage} / {numberOfQuiz}
      </p>
      <QuizContent curQuiz={curQuiz} dispatch={dispatch} />
    </div>
  );
}

function QuizContent({
  curQuiz,
  dispatch,
}: {
  curQuiz: TYPE_QUIZ_DATA | undefined;
  dispatch: (type: TYPE_ACTION_PAGINATION) => void;
}) {
  const question = curQuiz?.question;
  const answer = curQuiz?.answer;
  const [isAnswering, setIsAnswering] = useState(false);
  const [isCorrect, setIsCorrect] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch("add");
  }

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center">
      {isAnswering ? (
        <QuizAnswer question={question} onSubmitForm={handleSubmit} />
      ) : (
        <QuizResult
          answer={answer}
          isCorrect={isCorrect}
          userAnswer={userAnswer}
        />
      )}
    </div>
  );
}

function QuizAnswer({
  question,
  onSubmitForm,
}: {
  question: TYPE_QUIZ_QUESTION | undefined;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="flex flex-col items-center gap-3" onSubmit={onSubmitForm}>
      <h2 className="text-xl">{question?.sentence}</h2>
      <div>
        <p className="text-2xl text-center font-bold tracking-wide">
          {question?.name || question?.definitions}
        </p>
        {question?.audio && <ButtonAudio src={question.audio.data} />}
      </div>
      {question?.image && (
        <Image
          src={question.image.data}
          alt={question.image.name}
          width={500}
          height={350}
          className="w-[90%] aspect-[1/0.7] object-contain"
        />
      )}
      <textarea
        name="answer"
        placeholder="Your answer here"
        className="w-full aspect-[1/0.4] resize-none mt-3"
      ></textarea>
      <button
        type="submit"
        className="w-fit bg-orange-500 hover:bg-yellow-500 text-white px-1 rounded mt-2"
      >
        OK
      </button>
    </form>
  );
}

function QuizResult({
  answer,
  isCorrect,
  userAnswer,
}: {
  answer: TYPE_QUIZ_ANSWER | undefined;
  isCorrect: boolean;
  userAnswer: string;
}) {
  return (
    <div className="w-full h-fit">
      <p
        className={`text-2xl text-center ${isCorrect ? "text-red-500" : "text-blue-500"}`}
      >
        {isCorrect ? "Correct" : "Wrong"}
      </p>
      <div className="relative w-full min-h-56 mt-3 flex flex-col items-center justify-center">
        <Image
          src={`/icons/${isCorrect ? "circle" : "cross"}.svg`}
          alt={isCorrect ? "Correct image" : "Wrong image"}
          width={500}
          height={500}
          className="absolute w-56 aspect-square object-contain -z-10 opacity-55"
        ></Image>
        <p className="w-full text-xl">
          Correct answer: {answer?.name || answer?.definitions}
          <br />
          Your answer: {userAnswer}
        </p>
      </div>
    </div>
  );
}
