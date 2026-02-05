"use client";
// React
import { use, useEffect, useReducer, useState } from "react";
// Next.js
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Reducers
import { paginationReducer } from "@/app/lib/reducers";
// Settings
import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
// Components
import ButtonAudio from "@/app/Components/ButtonAudio";
// Methods
import {
  getNextReviewDate,
  getNextStatus,
  getRandomNumber,
  getUserDev,
  getUserWordsDev,
  getWordDataToDisplay,
} from "@/app/lib/helper";
// Types
import {
  TYPE_QUIZ_ANSWER,
  TYPE_QUIZ_DATA,
  TYPE_QUIZ_QUESTION,
  TYPE_WORD,
} from "@/app/lib/config/type";

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [numberOfQuiz, setNumberOfQuiz] = useState(0);
  const [quiz, setQuiz] = useState<TYPE_QUIZ_DATA[]>([]);
  const [curQuizIndex, setCurQuizIndex] = useState<number>();
  const [curQuizPage, dispatch] = useReducer(paginationReducer, 1);
  const [isAnswering, setIsAnswering] = useState(true);
  const [isCorrect, setIsCorrect] = useState(true);

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
        definitions: wordToDisplay.definitions,
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

  useEffect(() => {
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

        setCurQuizIndex(getRandomNumber(0, numberOfQuiz - 1));
      } catch (err: unknown) {
        console.error("Error", err);
      }
    };

    (async () => await getWordsForQuiz())();
  }, [id, numberOfQuiz]);

  function toggleIsAnswering() {
    setIsAnswering(!isAnswering);
  }

  function handleChangeIsCorrect(option: true | false | "toggle") {
    setIsCorrect((prev) => (option === "toggle" ? !prev : option));
  }

  function handleClickNext() {
    if (!curQuizIndex && curQuizIndex !== 0) return;

    // for dev
    const user = getUserDev(accessToken);
    if (!user) throw new Error("User not found!");
    const userWords = getUserWordsDev(user._id, id);
    const wordId = quiz[curQuizIndex].id;
    const word = userWords.find((word) => word._id === wordId);
    if (!word) return;
    console.log(word);

    const updatedWord = { ...word };
    const nextStatus = getNextStatus(updatedWord.status, isCorrect);
    updatedWord.status = nextStatus;
    updatedWord.nextReviewAt = getNextReviewDate(nextStatus);
    console.log(updatedWord);
    // update the word in database here

    dispatch("add");
    setQuiz((prev) => {
      // get rid of current quiz from quiz
      const newQuiz = [...prev].toSpliced(curQuizIndex, 1);

      // set new random index for next quiz
      setCurQuizIndex(getRandomNumber(0, newQuiz.length - 1));
      return newQuiz;
    });
    toggleIsAnswering();
  }

  console.log(curQuizIndex);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <p className="absolute top-2 right-3">
        {curQuizPage} / {numberOfQuiz}
      </p>
      <QuizContent
        curQuiz={
          curQuizIndex || curQuizIndex === 0 ? quiz[curQuizIndex] : undefined
        }
        isQuizFinished={curQuizPage === numberOfQuiz}
        isAnswering={isAnswering}
        isCorrect={isCorrect}
        toggleIsAnswering={toggleIsAnswering}
        handleChangeIsCorrect={handleChangeIsCorrect}
        onClickNext={handleClickNext}
      />
    </div>
  );
}

function QuizContent({
  curQuiz,
  isQuizFinished,
  isAnswering,
  isCorrect,
  toggleIsAnswering,
  handleChangeIsCorrect,
  onClickNext,
}: {
  curQuiz: TYPE_QUIZ_DATA | undefined;
  isQuizFinished: boolean;
  isAnswering: boolean;
  isCorrect: boolean;
  toggleIsAnswering: () => void;
  handleChangeIsCorrect: (option: true | false | "toggle") => void;
  onClickNext: () => void;
}) {
  const answer = curQuiz?.answer;
  const [userAnswer, setUserAnswer] = useState("");

  const convertStringToCompare = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-zA-Z0-9\s]/g, "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // get rid of spaces, change it to lowercase, and get rid of special characters
    const value = convertStringToCompare(String(formData.get("answer")));

    setUserAnswer(value);

    // If user aswers name from definitions
    if (answer?.name)
      handleChangeIsCorrect(convertStringToCompare(answer.name) === value);

    // If user answers definitions from name

    if (answer?.definitions) {
      // split value into words and get rid of empty spaces
      // const valueWordsArr = value
      //   .replaceAll("\n", " ")
      //   .split(" ")
      //   .filter((word) => word);

      const matchedAnswer = answer?.definitions?.find(
        (def) => convertStringToCompare(def) === value,
      );
      handleChangeIsCorrect(matchedAnswer ? true : false);
    }

    toggleIsAnswering();
  }

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center">
      {isAnswering ? (
        <QuizAnswer question={curQuiz?.question} onSubmitForm={handleSubmit} />
      ) : (
        <QuizResult
          answer={answer}
          afterSentence={curQuiz?.afterSentence}
          isCorrect={isCorrect}
          userAnswer={userAnswer}
          isQuizFinished={isQuizFinished}
          onClickCorrect={handleChangeIsCorrect}
          onClickNext={onClickNext}
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
  const textareaInputClassName = "mt-3";

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
      {question?.name ? (
        <textarea
          name="answer"
          placeholder="Your answer here"
          className={`${textareaInputClassName} w-full aspect-[1/0.4] resize-none`}
        ></textarea>
      ) : (
        <input
          name="answer"
          placeholder="Your answer here"
          className={`${textareaInputClassName} w-52`}
        ></input>
      )}
      <button
        type="submit"
        className="w-fit text-lg bg-orange-500 hover:bg-yellow-500 text-white px-1 rounded mt-2"
      >
        OK
      </button>
    </form>
  );
}

function QuizResult({
  answer,
  afterSentence,
  isCorrect,
  userAnswer,
  isQuizFinished,
  onClickCorrect,
  onClickNext,
}: {
  answer: TYPE_QUIZ_ANSWER | undefined;
  afterSentence: string | undefined;
  isCorrect: boolean;
  userAnswer: string;
  isQuizFinished: boolean;
  onClickCorrect: (option: true | false | "toggle") => void;
  onClickNext: () => void;
}) {
  const pAnswerClassName = "w-full text-xl";
  const buttonClassName =
    "transition-all duration-150 rounded leading-none w-fit text-sm";
  const pathnameToFolder = usePathname().replace("/quiz", "");

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
        <div className="w-full flex flex-row items-center">
          <p className={pAnswerClassName}>
            Correct answer: {answer?.name || answer?.definitions}
          </p>
          {answer?.audio && <ButtonAudio src={answer.audio.data} />}
        </div>
        <p className={pAnswerClassName}>Your answer: {userAnswer}</p>
        {answer?.image && (
          <Image
            src={answer.image.data}
            alt={answer.image.name}
            width={300}
            height={200}
            className="w-[80%] aspect-[1/0.6] object-contain"
          ></Image>
        )}
        <p className="mt-2">Examples: {afterSentence}</p>
        <div className="h-fit flex flex-row items-center gap-3 mt-5 text-white">
          {!isCorrect && (
            <>
              <button
                className={`${buttonClassName} bg-red-500 hover:bg-orange-500 py-1 px-2`}
                onClick={() => onClickCorrect(true)}
              >
                Mark as
                <br />
                correct
              </button>
              {answer?.definitions && (
                <button
                  className={`${buttonClassName} bg-orange-500 hover:bg-yellow-500 p-1`}
                >
                  Add to
                  <br />
                  definitions
                </button>
              )}
            </>
          )}
          {!isQuizFinished ? (
            <button
              className={`${buttonClassName} bg-green-500 hover:bg-yellow-500 p-2`}
              onClick={onClickNext}
            >
              Next
            </button>
          ) : (
            <Link
              href={pathnameToFolder}
              className={`${buttonClassName} bg-purple-500 hover:bg-pink-400 p-2`}
            >
              Finish
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
