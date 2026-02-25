"use client";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ButtonPlus from "@/app/Components/ButtonPlus";
import { nanoid } from "nanoid";
import { getSubmittedWordData, wait } from "../lib/helper";
import ImageWord from "../Components/ImageWord";
import AudioWord from "../Components/AudioWord";
import { getCollections } from "../lib/dal";
import { TYPE_COLLECTIONS, TYPE_DISPLAY_MESSAGE } from "../lib/config/type";
import PMessage from "../Components/PMessage";
import { addWords } from "../actions/auth/words";
import { FormStateWord } from "../lib/definitions";

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
  // const [allVocabData, setAllVocabData] = useState<object[] | []>([]);
  // const [isSubmitted, setIsSubmitted] = useState(false);

  async function displayMessage(msgData: TYPE_DISPLAY_MESSAGE) {
    setMessageData(msgData);
    await wait();
    setMessageData(undefined);
  }

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

  // const collectAllData = useCallback((data: object) => {
  //   setAllVocabData((prev) => [...prev, data]);
  // }, []);

  // function handleClickSubmit() {
  //   setIsSubmitted(true);
  // }

  useEffect(() => {
    const fetchCollections = async () => {
      const data = await getCollections();
      setCollections(data);
    };

    fetchCollections();
  }, []);

  // When all Word data is collected, send it to the server
  // useEffect(() => {
  //   function handleSubmitData() {
  //     console.log(allVocabData);
  //   }

  //   if (allVocabData.length === vocabKeys.length) handleSubmitData();
  // }, [allVocabData, vocabKeys]);

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
          // isSubmitted={isSubmitted}
          onClickDelete={() => handleClickDelete(i)}
          onClickOpenDictionary={() => handleOpenDictionary(i)}
          // collectAllData={collectAllData}
        />
      ))}
      <div className="mt-11">
        <ButtonPlus onClickButton={handleClickPlus} />
      </div>
      {vocabKeys.length !== 0 && (
        <button
          type="submit"
          className="bg-green-400 p-1 shadow-sm shadow-black/20 rounded text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-yellow-400"
          // onClick={handleClickSubmit}
        >
          Submit
        </button>
      )}
    </form>
  );
}

function Word({
  // isSubmitted,
  i,
  collections,
  onClickDelete,
  onClickOpenDictionary,
  // collectAllData,
}: {
  // isSubmitted: boolean;
  i: number;
  collections: TYPE_COLLECTIONS | undefined;
  onClickDelete: () => void;
  onClickOpenDictionary: () => void;
  // collectAllData: (data: object) => void;
}) {
  // const formRef = useRef<HTMLFormElement>(null);
  const textareaClassName = "w-[65%]";

  // useEffect(() => {
  //   async function sendDataToParent() {
  //     try {
  //       const target = formRef.current;
  //       const wordData = await getSubmittedWordData(target);
  //       if (!wordData) return;

  //       collectAllData(wordData);
  //     } catch (err: unknown) {
  //       console.error("Error", err);
  //     }
  //   }

  //   if (isSubmitted) sendDataToParent();
  // }, [isSubmitted, collectAllData]);

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
