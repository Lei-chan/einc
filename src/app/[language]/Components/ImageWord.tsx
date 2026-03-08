"use client";
import { Language } from "@/app/lib/config/types/others";
import { useState } from "react";

export default function ImageWord({
  language,
  type,
  index,
  imageTitle,
  onClickRemove,
}: {
  language: Language;
  type: "name" | "definitions";
  index?: number;
  imageTitle: string;
  onClickRemove?: (type: string) => void;
}) {
  const inputName = type === "name" ? "imageName" : "imageDefinitions";
  const titleForLanguage =
    language === "en"
      ? `Image for the ${type}:`
      : `${type === "name" ? "単語名" : "意味"}の画像:`;

  const [inputValue, setInputValue] = useState("");
  const [imgName, setImgName] = useState(imageTitle);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
  }

  function handleRemoveImage() {
    setImgName("");
    setInputValue("");
  }

  return (
    <>
      <span>{titleForLanguage}</span>
      <div className="w-fit flex flex-row gap-2 items-center">
        {imgName ? (
          <p>{imgName}</p>
        ) : (
          <input
            type="file"
            value={inputValue}
            name={inputName}
            accept="image/*"
            className="w-[75%] border-none my-1 p-0 text-sm cursor-pointer rounded-none"
            onChange={handleChangeInput}
          ></input>
        )}
        {(imgName || inputValue) && (
          <button
            type="button"
            className="h-fit bg-purple-800 text-white px-1 py-[2px] rounded text-xs"
            onClick={() => {
              handleRemoveImage();
              if (onClickRemove) onClickRemove(inputName);
            }}
          >
            {language === "en" ? "Remove" : "取消"}
          </button>
        )}
      </div>
    </>
  );
}
