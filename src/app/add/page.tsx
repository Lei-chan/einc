"use client";
import { useActionState, useEffect, useState } from "react";
// components
import ButtonPlus from "@/app/Components/ButtonPlus";
import ImageWord from "../Components/ImageWord";
import AudioWord from "../Components/AudioWord";
import PMessage from "../Components/PMessage";
// methods
import { getCollections } from "../lib/dal";
import { addWords } from "../actions/auth/words";
import { wait } from "../lib/helper";
// types
import { TYPE_COLLECTIONS, TYPE_DISPLAY_MESSAGE } from "../lib/config/type";
import { FormStateWord } from "../lib/definitions";
// libraries
import { nanoid } from "nanoid";

export default function Add() {
  const [vocabKeys, setVocabKeys] = useState([{ id: nanoid() }]);
  const [collections, setCollections] = useState<
    TYPE_COLLECTIONS | undefined
  >();
  const [messageData, setMessageData] = useState<TYPE_DISPLAY_MESSAGE>();

  const [state, action, isPending] = useActionState<FormStateWord, FormData>(
    addWords,
    undefined,
  );

  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);
  const [dictionaryIndex, setDictionaryIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const fetchCollections = async () => {
      const data = await getCollections();
      if (!data)
        return setMessageData({
          type: "error",
          message: "Error occured. Please try again this later 🙇‍♂️",
        });

      setCollections(data);
    };

    fetchCollections();
  }, []);

  return (
    <form
      className="w-full min-h-screen max-h-fit flex flex-col items-center py-6 gap-5"
      action={action}
    >
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      {isPending && <PMessage type="pending" message="Creating word..." />}
      {state?.error && (
        <PMessage type="error" message={state.error.message || ""} />
      )}
      {state?.message && <PMessage type="success" message={state.message} />}
      {vocabKeys.map((keyObj, i) => (
        <Word
          key={keyObj.id}
          i={i}
          collections={collections}
          onClickDelete={() => handleClickDelete(i)}
          onClickOpenDictionary={() => handleOpenDictionary(i)}
        />
      ))}
      <div className="mt-11">
        <ButtonPlus onClickButton={handleClickPlus} />
      </div>
      {vocabKeys.length !== 0 && (
        <button
          type="submit"
          className="bg-green-400 p-1 shadow-sm shadow-black/20 rounded text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-yellow-400"
        >
          Submit
        </button>
      )}
    </form>
  );
}

function Word({
  i,
  collections,
  onClickDelete,
  onClickOpenDictionary,
}: {
  i: number;
  collections: TYPE_COLLECTIONS | undefined;
  onClickDelete: () => void;
  onClickOpenDictionary: () => void;
}) {
  const textareaClassName = "w-[65%] aspect-[1/0.4] leading-tight text-[15px]";

  return (
    <div className="relative w-[90%] h-fit bg-gradient-to-l from-red-500 to-yellow-500 rounded-md shadow-md shadow-black/20 p-3">
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
            name={`name ${i}`}
            placeholder="word name"
            className="w-[55%]"
          ></input>
        </label>
        <AudioWord audioName={`audio ${i}`} audioTitle="" />
        <label>
          Definition:{" "}
          <textarea
            name={`definitions ${i}`}
            placeholder="definitions"
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <label>
          Examples:{" "}
          <textarea
            name={`examples ${i}`}
            placeholder="example sentences"
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <ImageWord type="name" index={i} imageTitle="" />
        <ImageWord type="definitions" index={i} imageTitle="" />
        <label>
          Add this word to:{" "}
          {collections && (
            <select name={`collection ${i}`} className="text-sm">
              {collections.map((col, i) => (
                <option key={i} value={col._id}>
                  {col.name}
                </option>
              ))}
            </select>
          )}
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
    </div>
  );
}
