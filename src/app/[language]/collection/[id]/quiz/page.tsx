"use client";
// React
import {
  startTransition,
  use,
  useActionState,
  useEffect,
  useReducer,
  useState,
} from "react";
// Next.js
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Components
import ButtonAudio from "@/app/[language]/Components/ButtonAudio";
import PMessage from "@/app/[language]/Components/PMessage";
// Reducers
import { paginationReducer } from "@/app/lib/reducers";
// actions
import {
  addDefinitions,
  updateStatusNextReviewDate,
} from "@/app/actions/auth/words";
// dal
import { getRandomWordsOneTurnQuiz } from "@/app/lib/dal";
// Methods
import {
  convertWordsToQuizData,
  getGenericErrorMessage,
  getLanguageFromPathname,
  getRandomNumber,
  getWordDataToDisplay,
  joinWithCommas,
  joinWithLineBreaks,
  wait,
} from "@/app/lib/helper";
// Types
import {
  DefinitionsDataQuiz,
  Language,
  QuizAnswer,
  QuizData,
  QuizQuestion,
  UpdateStatusReviewDateDataQuiz,
} from "@/app/lib/config/types/others";
import { FormStateWordJournal } from "@/app/lib/config/types/formState";
// libraries
// import distance from "jaro-winkler";

export default function Quiz({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const [quiz, setQuiz] = useState<QuizData[]>();
  const [numberOfQuiz, setNumberOfQuiz] = useState(0);

  const [curQuizIndex, setCurQuizIndex] = useState<number>();
  const [curQuizPage, dispatch] = useReducer(paginationReducer, 1);
  const [isAnswering, setIsAnswering] = useState(true);
  const [isCorrect, setIsCorrect] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  const [state, action] = useActionState<
    FormStateWordJournal,
    UpdateStatusReviewDateDataQuiz
  >(updateStatusNextReviewDate, undefined);

  useEffect(() => {
    const getWordsForQuiz = async () => {
      const quizWords = await getRandomWordsOneTurnQuiz(id);
      if (!quizWords) {
        setErrorMessage(getGenericErrorMessage(language));
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
  }, [id, language]);

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
    <div className="w-screen min-h-[100dvh] max-h-fit flex flex-col items-center justify-center py-10">
      {quiz && numberOfQuiz > 0 && (
        <p className="absolute top-2 right-3 lg:top-3 lg:right-4 xl:text-lg xl:top-4 xl:right-6 2xl:text-xl 2xl:top-5 2xl:right-7">
          {curQuizPage} / {numberOfQuiz}
        </p>
      )}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
      <p>
        {errorMessage && errorMessage}
        {!quiz && (language === "en" ? "Loading..." : "ロード中...")}
        {quiz &&
          !numberOfQuiz &&
          (language === "en"
            ? "There're no words to review"
            : "復習する単語はありません")}
      </p>
      {quiz && numberOfQuiz > 0 && (
        <QuizContent
          language={language}
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
  language,
  curQuiz,
  isQuizFinished,
  isAnswering,
  isCorrect,
  toggleIsAnswering,
  handleChangeIsCorrect,
  onClickNext,
}: {
  language: Language;
  curQuiz: QuizData | undefined;
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
    FormStateWordJournal,
    DefinitionsDataQuiz
  >(addDefinitions, undefined);

  // think later about replace all
  const convertStringToCompare = (str: string) =>
    str
      .trim()
      .toLowerCase()
      .replaceAll(".", "")
      .replaceAll(",", "")
      .replaceAll("、", "")
      .replaceAll("。", "");
  // .replaceAll(/[^a-zA-Z0-9\s]/g, "");

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

      setSuccessMessage(state.message[language]);
      await wait();
      setSuccessMessage("");
    };

    displaySuccessMessage();
  }, [state?.message, language]);

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center">
      {isPending && (
        <PMessage
          type="pending"
          message={
            language === "en" ? "Adding definitions..." : "意味を追加中..."
          }
        />
      )}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
      {successMessage && <PMessage type="success" message={successMessage} />}
      {isAnswering ? (
        <QuizAnswerForm
          language={language}
          question={curQuiz?.question}
          onSubmitForm={handleSubmit}
        />
      ) : (
        <QuizResult
          language={language}
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

function QuizAnswerForm({
  language,
  question,
  onSubmitForm,
}: {
  language: Language;
  question: QuizQuestion | undefined;
  onSubmitForm: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const textareaInputClassName =
    "w-[15rem] md:w-[16rem] lg:w-[17rem] xl:w-[18rem] mt-3";

  if (!question) return;

  return (
    <form
      className="flex flex-col items-center gap-4 lg:gap-5 xl:gap-6 2xl:gap-7"
      onSubmit={onSubmitForm}
    >
      <h2 className="text-xl">{question.sentence[language]}</h2>
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
          placeholder={language === "en" ? "Your answer here" : "答えを入力"}
          className={`${textareaInputClassName} w-full aspect-[1/0.4] resize-none`}
        ></textarea>
      ) : (
        <input
          name="answer"
          placeholder={language === "en" ? "Your answer here" : "答えを入力"}
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
  language,
  answer,
  afterSentence,
  isCorrect,
  userAnswer,
  isQuizFinished,
  onClickCorrect,
  onClickNext,
  onClickAddDefinitions,
}: {
  language: Language;
  answer: QuizAnswer | undefined;
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
    <div className="w-[15rem] xl:w-[18rem] h-fit">
      <p
        className={`text-2xl text-center ${isCorrect ? "text-red-500" : "text-blue-500"}`}
      >
        {isCorrect && (language === "en" ? "Correct" : "正解")}
        {!isCorrect && (language === "en" ? "Wrong" : "不正解")}
      </p>
      <div className="relative w-full min-h-56 max-h-fit mt-3 flex flex-col items-center justify-center gap-1 lg:gap-2 xl:gap-3 2xl:gap-4">
        <Image
          src={`/icons/${isCorrect ? "circle" : "cross"}.svg`}
          alt={
            isCorrect && language === "en"
              ? "Correct image"
              : isCorrect && language === "ja"
                ? "正解画像"
                : !isCorrect && language === "en"
                  ? "Wrong image"
                  : "不正解画像"
          }
          width={500}
          height={500}
          className="absolute w-[85%] aspect-square object-contain -z-10 opacity-55"
        ></Image>
        <div>
          <div className="flex flex-row items-center">
            <p className={pAnswerClassName}>
              {language === "en" ? "Correct answer" : "正しい回答"}:{" "}
              {answer.name || joinWithCommas(answer.definitions || [])}
              {answer?.audio && <ButtonAudio src={answer.audio.data} />}
            </p>
          </div>
          <p className={pAnswerClassName}>
            {language === "en" ? "Your answer" : "あなたの回答"}:{" "}
            {joinWithCommas(userAnswer)}
          </p>
        </div>
        {answer?.image && (
          <Image
            src={answer.image.data}
            alt={answer.image.name}
            width={300}
            height={200}
            className="w-[80%] aspect-[1/0.6] object-contain"
          ></Image>
        )}
        <p className="mt-2">
          {language === "en" ? "Examples" : "例文"}: {afterSentence}
        </p>
        <div className="h-fit flex flex-row items-center gap-3 lg:gap-4 xl:gap-5 2xl:gap-6 mt-5 text-white">
          {isCorrect ? (
            <button
              className={`${buttonClassName} bg-blue-500 hover:bg-blue-300 py-1 px-2`}
              onClick={() => onClickCorrect(false)}
            >
              {language === "en" ? "Mark as" : "不正解に"}
              <br />
              {language === "en" ? "wrong" : "する"}
            </button>
          ) : (
            <>
              <button
                className={`${buttonClassName} bg-red-500 hover:bg-orange-500 py-1 px-2`}
                onClick={() => onClickCorrect(true)}
              >
                {language === "en" ? "Mark as" : "正解に"}
                <br />
                {language === "en" ? "correct" : "する"}
              </button>
              {answer?.definitions && userAnswer.length > 0 && (
                <button
                  className={`${buttonClassName} bg-orange-500 hover:bg-yellow-500 p-1`}
                  onClick={onClickAddDefinitions}
                >
                  {language === "en" ? "Add this" : "この意味を"}
                  <br />
                  {language === "en" ? "definition" : "追加"}
                </button>
              )}
            </>
          )}
          {!isQuizFinished ? (
            <button
              className={`${buttonClassName} bg-green-500 hover:bg-yellow-500 p-2`}
              onClick={onClickNext}
            >
              {language === "en" ? "Next" : "次へ"}
            </button>
          ) : (
            <Link
              href={pathnameToFolder}
              className={`${buttonClassName} bg-purple-500 hover:bg-pink-400 p-2`}
            >
              {language === "en" ? "Finish" : "終了"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
