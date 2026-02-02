"use client";
import { useEffect, useReducer, useState } from "react";
import { TYPE_WORD } from "../lib/config/type";
import { getSubmittedWordData, getWordDataToDisplay } from "../lib/helper";
import { checkboxReducer } from "../lib/reducers";
import AudioWord from "./AudioWord";
import ImageWord from "./ImageWord";
import Image from "next/image";

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
            audioName={wordDataToDisplay.audio?.name || ""}
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
              value={wordData.examples.join("\n")}
              className={`${textareaClassName} resize-none`}
              onChange={handleChangeTextarea}
            ></textarea>
          </label>
          <ImageWord
            type="word name"
            imageName={wordDataToDisplay.imageName?.name || ""}
            onClickRemove={handleClickRemove}
          />
          <ImageWord
            type="definitions"
            imageName={wordDataToDisplay.imageDefinitions?.name || ""}
            onClickRemove={handleClickRemove}
          />
          <button
            type="submit"
            className="w-fit bg-green-500 self-center text-white px-1 rounded hover:bg-green-300"
          >
            OK
          </button>
        </form>
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
        <p>
          {word.examples.map((exam, i) => (
            <span key={i}>
              • {exam}
              {exam !== word.examples.at(-1) && <br />}
            </span>
          ))}
        </p>
      </>
    );
  };

  function handleToggleEdit() {
    setIsEdited(!isEdited);
  }

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
    try {
      e.preventDefault();
      const data = await getSubmittedWordData(e.currentTarget);
      const audio = data?.audio;
      const imageName = data?.imageName;
      const imageDefinitions = data?.imageDefinitions;

      // replace images
      const newData = { ...data };
      newData.audio = audio || wordData.audio;
      newData.imageName = imageName || wordData?.imageName;
      newData.imageDefinitions = imageDefinitions || wordData?.imageDefinitions;

      console.log(newData);
    } catch (err: unknown) {
      console.error("Error", err);
    }
  }

  // when user finished selecting, reset isChecked for the checkbox
  useEffect(() => {
    if (!isSelected) dispatch(false);
  }, [isSelected]);

  // When user change the input of isAllSelected, change isChecked accordingly
  useEffect(() => {
    if (isAllChecked) dispatch(isAllChecked);
  }, [isAllChecked]);

  return (
    <div className="flex flex-row gap-3">
      {isSelected && (
        <input
          type="checkbox"
          checked={isChecked}
          className="w-5"
          onChange={handleToggleChecked}
        ></input>
      )}
      <div
        className="relative w-full min-h-44 bg-yellow-100 shadow-md shadow-black/20 rounded flex flex-col items-center justify-center cursor-pointer"
        onClick={handleClickList}
      >
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
