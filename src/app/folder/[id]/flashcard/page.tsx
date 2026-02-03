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
// settings
import { FLASHCARD_QUIZ_ONE_TURN } from "@/app/lib/config/settings";
// types
import { TYPE_WORD } from "@/app/lib/config/type";

export default function Flashcard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [words, setWords] = useState<TYPE_WORD[]>();
  const [curCard, dispatch] = useReducer(paginationReducer, 1);

  useEffect(() => {
    //   For dev
    const getRandomNumberInRange = (totalNumberOfWords: number) =>
      Math.floor(Math.random() * (totalNumberOfWords - 1));

    const getRandomWords = (totalNumberOfWords: number) => {
      //   If totalNumberOfWords is less than maxWordsOneTurn, set all words
      if (FLASHCARD_QUIZ_ONE_TURN > totalNumberOfWords)
        return setWords(wordsDev);

      const randomNumbersSet: Set<number> = new Set([]);

      //   until set gets 20 random numbers
      while (randomNumbersSet.size < FLASHCARD_QUIZ_ONE_TURN) {
        randomNumbersSet.add(getRandomNumberInRange(totalNumberOfWords));
      }

      const randomNumbersArray = Array.from(randomNumbersSet);

      //   get random words using random numbers as indexes
      const randomWords = randomNumbersArray.map((num) => wordsDev[num]);

      setWords(randomWords);
    };

    getRandomWords(wordsDev.length);
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
