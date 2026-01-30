"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ButtonPlus from "@/app/Components/ButtonPlus";
import { nanoid } from "nanoid";
import { ImageWord } from "../Components/ImageWord";
import { getSubmittedWordData, resizeImage } from "../lib/helper";

export default function Add() {
  const [vocabKeys, setVocabKeys] = useState([{ id: nanoid() }]);
  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);
  const [dictionaryIndex, setDictionaryIndex] = useState<number | null>(null);
  const [allVocabData, setAllVocabData] = useState<object[] | []>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleClickPlus() {
    setVocabKeys((prev) => [...prev, { id: nanoid() }]);
  }

  function handleClickDelete(i: number) {
    setVocabKeys((prev) => prev.toSpliced(i, 1));
  }

  function handleOpenDictionary(i: number) {
    setIsDectionaryOpen(true);
    setDictionaryIndex(i);
  }

  function handleCloseDictionary() {
    setIsDectionaryOpen(false);
  }

  const collectAllData = useCallback((data: object) => {
    setAllVocabData((prev) => [...prev, data]);
  }, []);

  function handleClickSubmit() {
    setIsSubmitted(true);
  }

  // When all vocabulary data is collected, send it to the server
  useEffect(() => {
    function handleSubmitData() {
      console.log(allVocabData);
    }

    if (allVocabData.length === vocabKeys.length) handleSubmitData();
  }, [allVocabData, vocabKeys]);

  return (
    <div className="w-full min-h-screen max-h-fit flex flex-col items-center py-6 gap-5">
      {vocabKeys.map((keyObj, i) => (
        <Vocabulary
          key={keyObj.id}
          isSubmitted={isSubmitted}
          onClickDelete={() => handleClickDelete(i)}
          onClickOpenDictionary={() => handleOpenDictionary(i)}
          collectAllData={collectAllData}
        />
      ))}
      <div className="mt-11">
        <ButtonPlus onClickButton={handleClickPlus} />
      </div>
      <button
        type="button"
        className="bg-green-400 p-1 shadow-sm shadow-black/20 rounded text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-yellow-400"
        onClick={handleClickSubmit}
      >
        Submit
      </button>
    </div>
  );
}

function Vocabulary({
  isSubmitted,
  onClickDelete,
  onClickOpenDictionary,
  collectAllData,
}: {
  isSubmitted: boolean;
  onClickDelete: () => void;
  onClickOpenDictionary: () => void;
  collectAllData: (data: object) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaClassName = "w-[65%]";

  useEffect(() => {
    async function sendDataToParent() {
      try {
        const target = formRef.current;
        const wordData = await getSubmittedWordData(target);
        if(!wordData) return;

        collectAllData(wordData);
      } catch (err: unknown) {
        console.error("Error", err);
      }
    }

    if (isSubmitted) sendDataToParent();
  }, [isSubmitted, collectAllData]);

  return (
    <form
      ref={formRef}
      className="relative w-[90%] h-fit bg-gradient-to-l from-red-500 to-yellow-500 rounded-md shadow-md shadow-black/20 p-3"
    >
      <button
        type="button"
        className="absolute text-2xl top-0 right-2 text-white"
        onClick={onClickDelete}
      >
        &times;
      </button>
      <div className="flex flex-col gap-2 pb-3">
        <label>
          Word: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            name="name"
            placeholder="word name"
            className="w-[55%]"
          ></input>
        </label>
        <label>
          Audio:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input name="audio" placeholder="audio" className="w-[55%]"></input>
        </label>
        <label>
          Definition:{" "}
          <textarea
            name="definitions"
            placeholder="definitions"
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <label>
          Examples:{" "}
          <textarea
            name="examples"
            placeholder="example sentences"
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <ImageWord type="word name" imageName="" />
        <ImageWord type="definitions" imageName="" />
        <label>
          Add this word to:{" "}
          <select name="folder" className="text-sm">
            <option value="all">All</option>
            {/* more options are gonna come here depending on user's number of folders */}
          </select>
        </label>
      </div>
      <div className="w-full h-full border-t-2 border-solid border-orange-700/90 text-center flex flex-col justify-center pt-4">
        <button
          type="button"
          className="underline decoration-inherit"
          onClick={onClickOpenDictionary}
        >
          Select word from dictionary
        </button>
      </div>
    </form>
  );
}
