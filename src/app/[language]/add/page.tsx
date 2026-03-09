"use client";
// react
import { startTransition, useActionState, useEffect, useState } from "react";
// next.js
import { usePathname, useRouter } from "next/navigation";
// components
import ButtonPlus from "@/app/[language]/Components/ButtonPlus";
import ImageWord from "../Components/ImageWord";
import AudioWord from "../Components/AudioWord";
import PMessage from "../Components/PMessage";
// action
import { addWords } from "../../actions/auth/words";
// dal
import { getCollections } from "../../lib/dal";
// methods
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getMessagesFromFieldError,
  getNextReviewDate,
  resizeImages,
  wait,
} from "../../lib/helper";
// types
import { FormStateWordJournal } from "../../lib/config/types/formState";
import {
  Collections,
  DisplayMessage,
  Language,
  WordBeforeSent,
} from "@/app/lib/config/types/others";
// libraries
import { nanoid } from "nanoid";

export default function Add() {
  const router = useRouter();
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const [vocabKeys, setVocabKeys] = useState([{ id: nanoid() }]);
  const [collections, setCollections] = useState<Collections | undefined>();
  const [messageData, setMessageData] = useState<DisplayMessage>();

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    WordBeforeSent[]
  >(addWords, undefined);

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      // reset message data
      setMessageData(undefined);

      const formData = new FormData(e.currentTarget);
      const formDataArr = [...formData];
      if (!formDataArr.length)
        throw new Error(
          language === "en"
            ? "At least one word is required"
            : "最低でも一つ以上の単語を送信してください",
        );

      // get a property key of  the last element
      const lastElementProperty = String(formDataArr.at(-1)?.at(0));
      // take the last letter(index) that is put on the key
      const lastWordIndex = Number(lastElementProperty.at(-1));

      // Add 1 to index because index is 0 base
      const emptyArrToSetWords = new Array(lastWordIndex + 1).fill("");

      const resizedImages = await Promise.all(
        emptyArrToSetWords.map((_, i) =>
          resizeImages([
            formData.get(`imageName ${i}`) as File,
            formData.get(`imageDefinitions ${i}`) as File,
          ]),
        ),
      );

      const addedWords = emptyArrToSetWords.map((_, i) => {
        const [imageName, imageDefinitions] = resizedImages[i];

        return {
          collectionId: String(formData.get(`collection ${i}`) || ""),
          name: String(formData.get(`name ${i}`) || ""),
          audio: formData.get(`audio ${i}`) as File,
          definitions: String(formData.get(`definitions ${i}`) || ""),
          examples: String(formData.get(`examples ${i}`) || ""),
          imageName,
          imageDefinitions,
          status: 0,
          nextReviewAt: getNextReviewDate(0),
        };
      });

      startTransition(() => action(addedWords));
    } catch (err: unknown) {
      console.error("Error occured.", err);
      setMessageData({
        type: "error",
        message: getGenericErrorMessage(language),
      });
    }
  }

  useEffect(() => {
    const fetchCollections = async () => {
      const data = await getCollections();
      if (!data)
        return setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });

      setCollections(data);
    };

    fetchCollections();
  }, [language]);

  useEffect(() => {
    if (!state?.message) return;

    const displayMessageAndNavigate = async () => {
      if (state.message) {
        setMessageData({ type: "success", message: state.message[language] });
        await wait(2);
        router.push("/main");
      }
    };

    displayMessageAndNavigate();
  }, [state?.message, router, language]);

  return (
    <form
      className="w-full min-h-screen max-h-fit flex flex-col items-center py-6 md:py-8 lg:py-9 2xl:py-10 gap-7 md:gap-8 lg:gap-10"
      onSubmit={handleSubmit}
    >
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      {isPending && (
        <PMessage
          type="pending"
          message={language === "en" ? "Creating word..." : "単語を作成中..."}
        />
      )}
      {state?.errors && (
        <PMessage
          type="error"
          message={getMessagesFromFieldError(language, state.errors)}
        />
      )}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
      {vocabKeys.map((keyObj, i) => (
        <Word
          key={keyObj.id}
          language={language}
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
          {language === "en" ? "Submit" : "完了"}
        </button>
      )}
    </form>
  );
}

function Word({
  language,
  i,
  collections,
  onClickDelete,
  onClickOpenDictionary,
}: {
  language: Language;
  i: number;
  collections: Collections | undefined;
  onClickDelete: () => void;
  onClickOpenDictionary: () => void;
}) {
  const textareaClassName =
    "w-[65%] aspect-[1/0.4] leading-tight text-[15px] py-1 px-[5px]";

  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  // if collectionId => collectionId, otherwise => the collection 'All' id
  useEffect(() => {
    const setcollectionIdFromHash = () => {
      const collectionIdFromHash = window.location.hash.slice(1);
      const collectionAllId = collections?.find((col) => col.allWords)?._id;

      setSelectedCollectionId(collectionIdFromHash || collectionAllId || "");
    };
    setcollectionIdFromHash();
  }, [collections]);

  function handleChangeCollectionSelect(
    e: React.ChangeEvent<HTMLSelectElement>,
  ) {
    setSelectedCollectionId(e.currentTarget.value);
  }

  return (
    <div className="relative w-[18rem] sm:w-[19rem] md:w-[20rem] lg:w-[22rem] xl:w-[23rem] 2xl:w-[24rem] h-fit bg-gradient-to-l from-red-500 to-yellow-500 rounded-md shadow-md shadow-black/20 p-3 md:p-4 lg:p-5">
      <button
        type="button"
        className="absolute text-2xl top-0 right-2 text-white"
        onClick={onClickDelete}
      >
        &times;
      </button>
      <div className="flex flex-col gap-2 pb-3">
        <label>
          {language === "en" ? "Word" : "単語"}:
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            name={`name ${i}`}
            placeholder={language === "en" ? "word name" : "単語名"}
            className="w-[55%]"
          ></input>
        </label>
        <AudioWord language={language} audioName={`audio ${i}`} audioTitle="" />
        <label>
          {language === "en" ? "Definitions" : "意味"}:{" "}
          <textarea
            name={`definitions ${i}`}
            placeholder={language === "en" ? "definitions" : "意味"}
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <label>
          {language === "en" ? "Examples" : "例文"}:{" "}
          <textarea
            name={`examples ${i}`}
            placeholder={language === "en" ? "example sentences" : "例文"}
            className={`${textareaClassName} resize-none`}
          ></textarea>
        </label>
        <ImageWord language={language} type="name" index={i} imageTitle="" />
        <ImageWord
          language={language}
          type="definitions"
          index={i}
          imageTitle=""
        />
        <label>
          {language === "en" ? "Add this word to" : "追加するコレクション"}:{" "}
          {collections && (
            <select
              name={`collection ${i}`}
              className="text-sm"
              value={selectedCollectionId}
              onChange={handleChangeCollectionSelect}
            >
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
          {language === "en"
            ? "Select word from dictionary"
            : "辞書から単語を選択する"}
        </button>
      </div>
    </div>
  );
}
