"use client";
// react
import { use, useEffect, useReducer, useState } from "react";
// next.js
import Link from "next/link";
// reducers
import { paginationReducer } from "@/app/lib/reducers";
// models
import wordsDev from "@/app/ModelsDev/UserWord";
// components
import ButtonPagination from "@/app/Components/ButtonPagination";
import WordCard from "@/app/Components/WordCard";
// types
import { TYPE_WORD } from "@/app/lib/config/type";
import { getRandomWords } from "@/app/lib/logics/flashcard";

export default function Flashcard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [words, setWords] = useState<TYPE_WORD[]>();
  const [curCard, dispatch] = useReducer(paginationReducer, 1);

  useEffect(() => {
    const setRandomWords = () => setWords(getRandomWords(wordsDev.length));

    setRandomWords();
  }, []);

  function handleClickNextSession() {
    window.location.reload();
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className=" w-[90%] flex flex-col gap-10">
        {words && (
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
                  Go to next session
                </button>
              )}
              <Link
                href={`/folder/${id}`}
                className=" text-purple-600 hover:text-purple-400"
              >
                Exit
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
