// react
import { useState } from "react";
// types
import { Language } from "@/app/lib/config/type";

export default function AudioWord({
  language,
  audioTitle,
  audioName,
  onClickRemove,
}: {
  language: Language;
  audioTitle: string;
  audioName: string;
  onClickRemove?: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState(audioTitle);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
  }

  function handleRemoveAudio() {
    setInputValue("");
    setTitle("");
  }

  return (
    <>
      <div className="w-fit flex flex-row gap-2 items-center">
        <span>
          {language === "en" ? "Audio" : "オーディオ"}
          :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </span>
        {title ? (
          <p>{title}</p>
        ) : (
          <input
            type="file"
            value={inputValue}
            name={audioName || "audio"}
            accept="audio/*"
            className="w-[60%] border-none my-1 p-0 text-sm cursor-pointer rounded-none"
            onChange={handleChangeInput}
          ></input>
        )}
        {(inputValue || title) && (
          <button
            type="button"
            className="h-fit bg-purple-800 text-white px-1 py-[2px] rounded text-xs"
            onClick={() => {
              handleRemoveAudio();
              if (onClickRemove) onClickRemove();
            }}
          >
            {language === "en" ? "Remove" : "取消"}
          </button>
        )}
      </div>
    </>
  );
}
