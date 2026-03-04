"use client";
// react
import { use, useEffect, useReducer, useState } from "react";
// next.js
import Link from "next/link";
// reducers
import { paginationReducer } from "@/app/lib/reducers";
// components
import ButtonPagination from "@/app/Components/ButtonPagination";
import WordCard from "@/app/Components/WordCard";
// types
import { TYPE_WORD } from "@/app/lib/config/type";
import { getRandomWordsFlashcard } from "@/app/lib/dal";
export default function Flashcard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [words, setWords] = useState<TYPE_WORD[]>();
  const [curCard, dispatch] = useReducer(paginationReducer, 1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const setRandomWords = async () => {
      const randomWords = await getRandomWordsFlashcard(id);
      if (!randomWords) {
        setMessage("Unexpected error occured. Please try again this later 🙇‍♂️");
        return;
      }

      setWords(randomWords);
    };

    setRandomWords();
  }, [id]);

  function handleClickNextSession() {
    window.location.reload();
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className=" w-[90%] flex flex-col gap-10 items-center">
        <p>
          {message
            ? message
            : !words
              ? "Loading..."
              : words && words.length === 0
                ? "No words are registered yet"
                : ""}
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
                  Go to next session
                </button>
              )}
              <Link
                href={`/collection/${id}`}
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
