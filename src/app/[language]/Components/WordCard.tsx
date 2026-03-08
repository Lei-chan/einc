"use client";
// react
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
// next.js
import Image from "next/image";
import { usePathname } from "next/navigation";
// components
import AudioWord from "./AudioWord";
import ImageWord from "./ImageWord";
import PMessage from "./PMessage";
import ButtonAudio from "./ButtonAudio";
// actions
import { updateWord } from "../../actions/auth/words";
// methods
import {
  convertBufferToFile,
  getGenericErrorMessage,
  getLanguageFromPathname,
  getMessagesFromFieldError,
  getWordDataToDisplay,
  resizeImages,
  wait,
} from "../../lib/helper";
// types
import { WordData, WordBeforeSent } from "../../lib/config/types/others";
import { FormStateWordJournal } from "../../lib/config/types/formState";

export default function WordCard({
  type,
  word,
  handleUpdateUI,
}: {
  type: "list" | "flashcard";
  word: WordData;
  handleUpdateUI?: () => void;
}) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const maxPage = 3;
  const originalWordData = word;
  const wordDataToDisplay = getWordDataToDisplay(word);

  const [currentPage, setCurrentPage] = useState(1);
  const [isEdited, setIsEdited] = useState(false);
  const [wordData, setWordData] = useState<WordData | WordBeforeSent>(
    originalWordData,
  );

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    WordBeforeSent
  >(updateWord, undefined);
  const lastHandledUpdateRef = useRef<FormStateWordJournal>(null);
  const [errorMessage, setErrorMessage] = useState("");
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      // make image size smaller
      const [imageName, imageDefinitions] = (await resizeImages([
        formData.get("imageName") as File,
        formData.get("imageDefinitions") as File,
      ])) as (File | null)[];

      // data except for userId
      const submittedData = {
        _id: wordDataToDisplay._id,
        collectionId: wordDataToDisplay.collectionId,
        name: String(formData.get("name") || ""),
        audio: formData.get("audio") as File,
        definitions: String(formData.get("definitions") || ""),
        examples: String(formData.get("examples") || ""),
        imageName,
        imageDefinitions,
        status: wordDataToDisplay.status,
        nextReviewAt: wordDataToDisplay.nextReviewAt,
      };

      // if there are old media, convert the buffers to files
      const oldAudio = wordData.audio
        ? convertBufferToFile(wordData.audio)
        : null;
      const oldImageName = wordData.imageName
        ? convertBufferToFile(wordData.imageName)
        : null;
      const oldImageDefiniions = wordData.imageDefinitions
        ? convertBufferToFile(wordData.imageDefinitions)
        : null;

      // if user set new audio or images this time => use them, if user didn't set them this time but had already set them => use the previous ones
      submittedData.audio = submittedData.audio || oldAudio;
      submittedData.imageName = submittedData.imageName || oldImageName;
      submittedData.imageDefinitions =
        submittedData.imageDefinitions || oldImageDefiniions;

      startTransition(() => action(submittedData));
    } catch (err: unknown) {
      console.log("Unexpected error", err);
      setErrorMessage(getGenericErrorMessage(language));
    }
  }

  useEffect(() => {
    const message = state?.message;
    // if it's already been called or no message => return
    if (lastHandledUpdateRef.current === state || !message) return;

    lastHandledUpdateRef.current = state;

    const displayMessage = async () => {
      handleToggleEdit();
      setSuccessMessage(message[language]);
      await wait();
      setSuccessMessage("");
    };

    displayMessage();
    if (handleUpdateUI) handleUpdateUI();
  }, [state?.message, language, handleToggleEdit, state, handleUpdateUI]);

  const getContent = () => {
    const textareaClassName = "w-[65%]";
    const h3ClassName = "text-black/80 text-lg";
    const pClassName = "w-[90%]";
    const imageClassName = "my-2 px-2";

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
              {language === "en" ? "Word" : "単語"}:
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input
                name="name"
                placeholder={language === "en" ? "word name" : "単語名"}
                value={wordData.name}
                className="w-[55%]"
                onChange={handleChangeInput}
              ></input>
            </label>
            <AudioWord
              language={language}
              audioTitle={wordDataToDisplay.audio?.name || ""}
              audioName=""
              onClickRemove={() => handleClickRemove("audio")}
            />
            <label>
              {language === "en" ? "Definition" : "意味"}:{" "}
              <textarea
                name="definitions"
                placeholder={language === "en" ? "definitions" : "意味"}
                value={
                  typeof wordData.definitions === "string"
                    ? wordData.definitions
                    : wordData.definitions.join("\n")
                }
                className={`${textareaClassName} resize-none`}
                onChange={handleChangeTextarea}
              ></textarea>
            </label>
            <label>
              {language === "en" ? "Examples" : "例文"}:{" "}
              <textarea
                name="examples"
                placeholder={language === "en" ? "example sentences" : "例文"}
                value={
                  typeof wordData.examples === "string"
                    ? wordData.examples
                    : wordData.examples?.join("\n")
                }
                className={`${textareaClassName} resize-none`}
                onChange={handleChangeTextarea}
              ></textarea>
            </label>
            <ImageWord
              language={language}
              type="name"
              imageTitle={wordDataToDisplay.imageName?.name || ""}
              onClickRemove={handleClickRemove}
            />
            <ImageWord
              language={language}
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
          <div className="flex flex-row items-center gap-2">
            <p className="w-fit text-3xl overflow-hidden whitespace-nowrap text-ellipsis">
              {word.name}
            </p>
            {wordDataToDisplay.audio && (
              <ButtonAudio src={wordDataToDisplay.audio.data} />
            )}
          </div>
          {wordDataToDisplay.imageName && (
            <Image
              src={wordDataToDisplay.imageName.data}
              alt={wordDataToDisplay.imageName.name || "Word name image"}
              width={500}
              height={400}
              className={imageClassName}
            ></Image>
          )}
        </>
      );

    if (currentPage === 2)
      return (
        <>
          <h3 className={h3ClassName}>
            {language === "en" ? "Definitions" : "意味"}
          </h3>
          <p className={pClassName}>
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
                wordDataToDisplay.imageDefinitions.name || language === "en"
                  ? "Definition image"
                  : "意味の画像"
              }
              width={500}
              height={400}
              className={imageClassName}
            ></Image>
          )}
        </>
      );

    return (
      <>
        <h3 className={h3ClassName}>
          {language === "en" ? "Examples" : "例文"}
        </h3>
        {word.examples && word.examples?.length > 0 && (
          <p className={pClassName}>
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
    <div
      className="relative w-full min-h-44 max-h-fit bg-yellow-100 shadow-md shadow-black/20 rounded flex flex-col items-center justify-center cursor-pointer py-3"
      onClick={handleClickList}
    >
      <div className="absolute w-full top-1 flex flex-col items-center z-10">
        {isPending && (
          <PMessage
            type="pending"
            message={language === "en" ? "Updating word..." : "単語を更新中..."}
          />
        )}
        {state?.errors && (
          <PMessage
            type="error"
            message={getMessagesFromFieldError(language, state?.errors)}
          />
        )}
        {(state?.error?.message || errorMessage) && (
          <PMessage
            type="error"
            message={
              state?.error?.message
                ? state.error.message[language]
                : errorMessage
            }
          />
        )}
        {successMessage && <PMessage type="success" message={successMessage} />}
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
  );
}
