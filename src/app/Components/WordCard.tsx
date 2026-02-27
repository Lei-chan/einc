"use client";
// react
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
// next.js
import Image from "next/image";
// reducers
import { checkboxReducer } from "../lib/reducers";
// components
import AudioWord from "./AudioWord";
import ImageWord from "./ImageWord";
import PMessage from "./PMessage";
// actions
import { updateWord } from "../actions/auth/words";
// methods
import { getWordDataToDisplay, wait } from "../lib/helper";
// types
import { TYPE_WORD, TYPE_WORD_BEFORE_SENT } from "../lib/config/type";
import { FormStateWord } from "../lib/definitions";

export default function WordCard({
  type,
  word,
  isSelected,
  isAllChecked,
}: {
  type: "list" | "flashcard";
  word: TYPE_WORD;
  isSelected?: boolean;
  isAllChecked?: boolean;
}) {
  const maxPage = 3;
  const originalWordData = word;
  const wordDataToDisplay = getWordDataToDisplay(word);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChecked, dispatch] = useReducer(checkboxReducer, false);
  const [isEdited, setIsEdited] = useState(false);
  const [wordData, setWordData] = useState<TYPE_WORD>(originalWordData);

  const [state, action, isPending] = useActionState<
    FormStateWord,
    TYPE_WORD_BEFORE_SENT
  >(updateWord, undefined);
  const lastHandledUpdateRef = useRef<FormStateWord>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleToggleEdit = useCallback(() => {
    setIsEdited(!isEdited);
  }, [isEdited]);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    const value = target.value;
    setWordData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget;
    const value = target.value.split("\n");
    setWordData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  }

  function handleClickList(e: React.MouseEvent<HTMLDivElement>) {
    if (e.currentTarget === e.target)
      setCurrentPage((prev) => (prev === maxPage ? 1 : prev + 1));
  }

  function handleToggleChecked() {
    dispatch("toggle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // data except for userId
    const submittedData = {
      _id: wordDataToDisplay._id,
      collectionId: wordDataToDisplay.collectionId,
      name: String(formData.get("name") || ""),
      audio: formData.get("audio") as File,
      definitions: String(formData.get("definitions") || ""),
      examples: String(formData.get("examples") || ""),
      imageName: formData.get("imageName") as File,
      imageDefinitions: formData.get("imageDefinitions") as File,
      status: wordDataToDisplay.status,
      nextReviewAt: wordDataToDisplay.nextReviewAt,
    };

    const audio = submittedData?.audio;
    const imageName = submittedData?.imageName;
    const imageDefinitions = submittedData?.imageDefinitions;

    // if user set new audio or images this time => use them, if user didn't set them this time but had already set them => use the previous ones
    submittedData.audio = audio || wordData.audio;
    submittedData.imageName = imageName || wordData?.imageName;
    submittedData.imageDefinitions =
      imageDefinitions || wordData?.imageDefinitions;

    startTransition(() => action(submittedData));
  }

  // when user finished selecting, reset isChecked for the checkbox
  useEffect(() => {
    if (!isSelected) dispatch(false);
  }, [isSelected]);

  // When user change the input of isAllSelected, change isChecked accordingly
  useEffect(() => {
    if (isAllChecked) dispatch(isAllChecked);
  }, [isAllChecked]);

  useEffect(() => {
    const message = state?.message;
    // if it's already been called or no message => return
    if (lastHandledUpdateRef.current === state || !message) return;

    lastHandledUpdateRef.current = state;

    const displayMessage = async () => {
      handleToggleEdit();
      setSuccessMessage(message);
      await wait();
      setSuccessMessage("");
    };

    displayMessage();
  }, [state?.message, handleToggleEdit, state]);

  const getContent = () => {
    const textareaClassName = "w-[65%]";
    const h3ClassName = "text-black/80 text-lg";

    function handleClickRemove(type: string) {
      setWordData((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }

    if (isEdited)
      return (
        <>
          <form className="flex flex-col gap-2 p-3" onSubmit={handleSubmit}>
            <label>
              Word: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                name="name"
                placeholder="word name"
                value={wordData.name}
                className="w-[55%]"
                onChange={handleChangeInput}
              ></input>
            </label>
            <AudioWord
              audioTitle={wordDataToDisplay.audio?.name || ""}
              audioName=""
              onClickRemove={() => handleClickRemove("audio")}
            />
            <label>
              Definition:{" "}
              <textarea
                name="definitions"
                placeholder="definitions"
                value={wordData.definitions.join("\n")}
                className={`${textareaClassName} resize-none`}
                onChange={handleChangeTextarea}
              ></textarea>
            </label>
            <label>
              Examples:{" "}
              <textarea
                name="examples"
                placeholder="example sentences"
                value={wordData.examples?.join("\n")}
                className={`${textareaClassName} resize-none`}
                onChange={handleChangeTextarea}
              ></textarea>
            </label>
            <ImageWord
              type="word name"
              imageTitle={wordDataToDisplay.imageName?.name || ""}
              onClickRemove={handleClickRemove}
            />
            <ImageWord
              type="definitions"
              imageTitle={wordDataToDisplay.imageDefinitions?.name || ""}
              onClickRemove={handleClickRemove}
            />
            <button
              type="submit"
              className="w-fit bg-green-500 self-center text-white px-1 rounded hover:bg-green-300"
            >
              OK
            </button>
          </form>
        </>
      );

    if (currentPage === 1)
      return (
        <>
          <p className="text-3xl">{word.name}</p>
          {wordDataToDisplay.imageName && (
            <Image
              src={wordDataToDisplay.imageName.data}
              alt={wordDataToDisplay.imageName.name || "Word name image"}
              width={500}
              height={400}
            ></Image>
          )}
        </>
      );

    if (currentPage === 2)
      return (
        <>
          <h3 className={h3ClassName}>Definitions</h3>
          <p>
            {word.definitions.map((def, i) => (
              <span key={i}>
                • {def}
                {def !== word.definitions.at(-1) && <br />}
              </span>
            ))}
          </p>
          {wordDataToDisplay.imageDefinitions && (
            <Image
              src={wordDataToDisplay.imageDefinitions.data}
              alt={
                wordDataToDisplay.imageDefinitions.name || "Definition image"
              }
            ></Image>
          )}
        </>
      );

    return (
      <>
        <h3 className={h3ClassName}>Examples</h3>
        {word.examples && word.examples?.length > 0 && (
          <p>
            {word.examples.map((exam, i) => (
              <span key={i}>
                • {exam}
                {exam !== word.examples?.at(-1) && <br />}
              </span>
            ))}
          </p>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-row gap-3">
      {isSelected && (
        <input
          type="checkbox"
          name={wordDataToDisplay._id}
          checked={isChecked}
          className="w-5"
          onChange={handleToggleChecked}
        ></input>
      )}
      <div
        className="relative w-full min-h-44 bg-yellow-100 shadow-md shadow-black/20 rounded flex flex-col items-center justify-center cursor-pointer"
        onClick={handleClickList}
      >
        <div className="absolute w-full top-1 flex flex-col items-center z-10">
          {isPending && <PMessage type="pending" message="Updating word..." />}
          {state?.error && (
            <PMessage type="error" message={state.error?.message || ""} />
          )}
          {successMessage && (
            <PMessage type="success" message={successMessage} />
          )}
        </div>
        {type === "list" && (
          <button
            type="button"
            className="absolute w-4 aspect-square bg-[url('/icons/edit.svg')] bg-center bg-contain bg-no-repeat right-3 top-2 transition-all duration-150 hover:translate-y-[-2px]"
            onClick={handleToggleEdit}
          ></button>
        )}
        {getContent()}
      </div>
    </div>
  );
}
