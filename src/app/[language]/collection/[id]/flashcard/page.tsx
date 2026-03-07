"use client";
// react
import { use, useEffect, useReducer, useState } from "react";
// next.js
import Link from "next/link";
// reducers
import { paginationReducer } from "@/app/lib/reducers";
// components
import ButtonPagination from "@/app/[language]/Components/ButtonPagination";
import WordCard from "@/app/[language]/Components/WordCard";
// types
import { TYPE_WORD } from "@/app/lib/config/type";
import { getRandomWordsFlashcard } from "@/app/lib/dal";
import { usePathname } from "next/navigation";
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
} from "@/app/lib/helper";

export default function Flashcard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const [words, setWords] = useState<TYPE_WORD[]>();
  const [curCard, dispatch] = useReducer(paginationReducer, 1);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const setRandomWords = async () => {
      const randomWords = await getRandomWordsFlashcard(id);
      if (!randomWords) {
        setErrorMessage(getGenericErrorMessage(language));
        return;
      }

      setWords(randomWords);
    };

    setRandomWords();
  }, [id, language]);

  function handleClickNextSession() {
    window.location.reload();
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className=" w-[90%] flex flex-col gap-10 items-center">
        <p>
          {errorMessage && errorMessage}
          {!words && (language === "en" ? "Loading..." : "ロード中...")}
          {words &&
            words.length === 0 &&
            (language === "en"
              ? "No words are registered yet"
              : "単語が登録されていません")}
        </p>
        {words && words.length !== 0 && (
          <>
            <RemainingWords curCard={curCard} numberOfWords={words.length} />
            <WordCard type="flashcard" word={words[curCard - 1]} />
            <ButtonPagination
              numberOfPages={words.length}
              curPage={curCard}
              showNumber={false}
              onClickPagination={dispatch}
            />
            <div className="absolute w-[90%] flex flex-col items-center gap-2 bottom-3">
              {curCard === words.length && (
                <button
                  type="button"
                  className="w-fit transition-all duration-150 bg-green-400  hover:bg-yellow-500 text-white px-1 rounded"
                  onClick={handleClickNextSession}
                >
                  {language === "en"
                    ? "Go to next session"
                    : "次のセッションへ"}
                </button>
              )}
              <Link
                href={`/collection/${id}`}
                className=" text-purple-600 hover:text-purple-400"
              >
                {language === "en" ? "Exit" : "終了"}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RemainingWords({
  curCard,
  numberOfWords,
}: {
  curCard: number;
  numberOfWords: number;
}) {
  return (
    <p className="absolute top-2 right-3">
      {curCard} / {numberOfWords}
    </p>
  );
}
