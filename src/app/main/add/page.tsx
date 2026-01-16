"use client";
import { useState } from "react";
import Link from "next/link";
import ButtonPlus from "@/app/Components/ButtonPlus";
import { nanoid } from "nanoid";

export default function Add() {
  const [vocabKeys, setVocabKeys] = useState([{ id: nanoid() }]);

  function handleClickPlus() {
    setVocabKeys((prev) => [...prev, { id: nanoid() }]);
  }

  function handleClickDelete(i: number) {
    setVocabKeys((prev) => prev.toSpliced(i, 1));
  }
  return (
    <div className="w-full min-h-screen max-h-fit flex flex-col items-center py-6 gap-5">
      {vocabKeys.map((keyObj, i) => (
        <Vocabulary
          key={keyObj.id}
          onClickDelete={() => handleClickDelete(i)}
        />
      ))}
      <div className="mt-11">
        <ButtonPlus onClickButton={handleClickPlus} />
      </div>
    </div>
  );
}

function Vocabulary({ onClickDelete }: { onClickDelete: () => void }) {
  const inputTextareaClassName = "w-[65%]";
  return (
    <form className="relative w-[90%] h-[14rem] bg-gradient-to-l from-red-500 to-orange-400 rounded-md shadow-md shadow-black/20 p-3 flex flex-col gap-2">
      <button
        type="button"
        className="absolute text-2xl top-0 right-2 text-white"
        onClick={onClickDelete}
      >
        &times;
      </button>
      <label>
        Word: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input placeholder="word name" className="w-[55%]"></input>
      </label>
      <label>
        Definition:{" "}
        <textarea
          placeholder="definition"
          className={`${inputTextareaClassName} resize-none`}
        ></textarea>
      </label>
      <label>
        Examples:{" "}
        <textarea
          placeholder="example sentences"
          className={`${inputTextareaClassName} resize-none`}
        ></textarea>
      </label>
      <div className="w-full h-full border-t-2 border-solid border-orange-700/90 text-center flex flex-col justify-center">
        <Link
          href="/main/dictionary/select"
          className="underline decoration-inherit"
        >
          Select word from dictionary
        </Link>
      </div>
    </form>
  );
}
