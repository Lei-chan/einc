"use client";
// React
import {
  startTransition,
  use,
  useActionState,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
// Next.js
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Reducers
import { paginationReducer } from "@/app/lib/reducers";
// Components
import ButtonAudio from "@/app/Components/ButtonAudio";
// Methods
import {
  convertWordsToQuizData,
  getRandomNumber,
  getWordDataToDisplay,
  joinWithCommas,
  joinWithLineBreaks,
  wait,
} from "@/app/lib/helper";
// Types
import {
  TYPE_QUIZ_ANSWER,
  TYPE_QUIZ_DATA,
  TYPE_QUIZ_QUESTION,
} from "@/app/lib/config/type";
import { getRandomWordsOneTurnQuiz } from "@/app/lib/dal";
import {
  addDefinitions,
  updateStatusNextReviewDate,
} from "@/app/actions/auth/words";
import {
  DefinitionsDataQuiz,
  FormStateWord,
  UpdateStatusReviewDateDataQuiz,
} from "@/app/lib/definitions";
import PMessage from "@/app/Components/PMessage";
// libraries
// import distance from "jaro-winkler";

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // const [numberOfQuiz, setNumberOfQuiz] = useState(0);
  const [quiz, setQuiz] = useState<TYPE_QUIZ_DATA[]>();
  const [numberOfQuiz, setNumberOfQuiz] = useState(0);

  const [curQuizIndex, setCurQuizIndex] = useState<number>();
  const [curQuizPage, dispatch] = useReducer(paginationReducer, 1);
  const [isAnswering, setIsAnswering] = useState(true);
  const [isCorrect, setIsCorrect] = useState(true);

  const [message, setMessage] = useState("");

  const [state, action] = useActionState<
    FormStateWord,
    UpdateStatusReviewDateDataQuiz
  >(updateStatusNextReviewDate, undefined);

  useEffect(() => {
    const getWordsForQuiz = async () => {
      const quizWords = await getRandomWordsOneTurnQuiz(id);
      if (!quizWords) {
        setMessage("Unexpected error occured. Please try again this later 🙇‍♂️");
        return;
      }

      const quizDataToDisplay = quizWords.map((word) =>
        getWordDataToDisplay(word),
      );
      const structuredQuizData = convertWordsToQuizData(quizDataToDisplay);

      setQuiz(structuredQuizData);

      const numOfQuiz = structuredQuizData.length;

      setNumberOfQuiz(numOfQuiz);

      setCurQuizIndex(getRandomNumber(0, numOfQuiz - 1));
    };

    getWordsForQuiz();
  }, [id]);

  function toggleIsAnswering() {
    setIsAnswering(!isAnswering);
  }

  function handleChangeIsCorrect(option: true | false | "toggle") {
    setIsCorrect((prev) => (option === "toggle" ? !prev : option));
  }

  async function handleClickNext() {
    if (!quiz) return;
    if (!curQuizIndex && curQuizIndex !== 0) return;

    const wordId = quiz[curQuizIndex].id;
    startTransition(() => action({ wordId, isCorrect }));

    // get rid of current quiz from quiz
    const newQuiz = quiz.toSpliced(curQuizIndex, 1);
    setQuiz(newQuiz);

    // new random index for next quiz
    const newQuizIndex = getRandomNumber(0, newQuiz.length - 1);
    setCurQuizIndex(newQuizIndex);

    dispatch("add");
    toggleIsAnswering();
  }

  return (
    <div className="w-screen min-h-screen max-h-fit flex flex-col items-center justify-center py-10">
      {quiz && numberOfQuiz > 0 && (
        <p className="absolute top-2 right-3">
          {curQuizPage} / {numberOfQuiz}
        </p>
      )}
      {state?.error && (
        <PMessage type="error" message={state.error.message || ""} />
      )}
      <p>
        {message
          ? message
          : !quiz
            ? "Loading..."
            : quiz && !numberOfQuiz
              ? "There're no words to review"
              : ""}
      </p>
      {quiz && numberOfQuiz > 0 && (
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
      )}
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
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [state, action, isPending] = useActionState<
    FormStateWord,
    DefinitionsDataQuiz
  >(addDefinitions, undefined);

  const convertStringToCompare = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-zA-Z0-9\s]/g, "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // get rid of spaces
    const value = String(formData.get("answer")).trim();

    if (answer?.name) {
      setUserAnswer([value]);

      // get rid of spaces, change it to lowercase, and get rid of special characters
      const valueToCompare = convertStringToCompare(value);

      // If user aswers name from definitions
      handleChangeIsCorrect(
        convertStringToCompare(answer.name) === valueToCompare,
      );
    }
    // If user answers definitions from name

    if (answer?.definitions) {
      // split by lines and get rid of empty spaces
      const values = value
        .split("\n")
        .map((value) => value.trim())
        .filter((answer) => answer);
      setUserAnswer(values);

      const valuesToCompare = values.map((answer) =>
        convertStringToCompare(answer),
      );

      // check if any definitions match any values
      const isAnswerMatched = answer.definitions.some((def) => {
        // check if the definition matches more than one values
        const isMatched = valuesToCompare.some(
          (value) =>
            convertStringToCompare(def) === convertStringToCompare(value),
        );
        return isMatched;
      });

      handleChangeIsCorrect(isAnswerMatched);
    }

    toggleIsAnswering();
  }

  async function handleClickAddDefinitions() {
    if (!curQuiz?.id) return;

    startTransition(() =>
      action({ wordId: curQuiz.id, newDefinitions: userAnswer }),
    );
  }

  useEffect(() => {
    const displaySuccessMessage = async () => {
      if (!state?.message) return;

      setSuccessMessage(state.message);
      await wait();
      setSuccessMessage("");
    };

    displaySuccessMessage();
  }, [state?.message]);

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center">
      {isPending && <PMessage type="pending" message="Adding definitions..." />}
      {state?.error && (
        <PMessage type="error" message={state.error.message || ""} />
      )}
      {successMessage && <PMessage type="success" message={successMessage} />}
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
          onClickAddDefinitions={handleClickAddDefinitions}
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

  if (!question) return;

  return (
    <form className="flex flex-col items-center gap-3" onSubmit={onSubmitForm}>
      <h2 className="text-xl">{question?.sentence}</h2>
      <div className="flex flex-row">
        <p
          className={`text-2xl font-bold tracking-wide ${question.name ? "text-center" : "text-left"}`}
        >
          {question?.name || joinWithLineBreaks(question?.definitions || [])}
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
  onClickAddDefinitions,
}: {
  answer: TYPE_QUIZ_ANSWER | undefined;
  afterSentence: string | undefined;
  isCorrect: boolean;
  userAnswer: string[];
  isQuizFinished: boolean;
  onClickCorrect: (option: true | false | "toggle") => void;
  onClickNext: () => void;
  onClickAddDefinitions: () => void;
}) {
  const pAnswerClassName = "w-full text-xl";
  const buttonClassName =
    "transition-all duration-150 rounded leading-none w-fit text-sm";
  const pathnameToFolder = usePathname().replace("/quiz", "");

  if (!answer) return;

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
            Correct answer:{" "}
            {answer.name || joinWithCommas(answer.definitions || [])}
          </p>
          {answer?.audio && <ButtonAudio src={answer.audio.data} />}
        </div>
        <p className={pAnswerClassName}>
          Your answer: {joinWithCommas(userAnswer)}
        </p>
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
          {isCorrect ? (
            <button
              className={`${buttonClassName} bg-blue-500 hover:bg-blue-300 py-1 px-2`}
              onClick={() => onClickCorrect(false)}
            >
              Mark as
              <br />
              wrong
            </button>
          ) : (
            <>
              <button
                className={`${buttonClassName} bg-red-500 hover:bg-orange-500 py-1 px-2`}
                onClick={() => onClickCorrect(true)}
              >
                Mark as
                <br />
                correct
              </button>
              {answer?.definitions && userAnswer.length > 0 && (
                <button
                  className={`${buttonClassName} bg-orange-500 hover:bg-yellow-500 p-1`}
                  onClick={onClickAddDefinitions}
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
