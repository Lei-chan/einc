"use client";
import { useCallback, useState } from "react";

export default function ImageWord({
  type,
  index,
  imageTitle,
  onClickRemove,
}: {
  type: string;
  index?: number;
  imageTitle: string;
  onClickRemove?: (type: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const [imgName, setImgName] = useState(imageTitle);

  const cammeledImageTitle =
    `image ${type}`
      .split(" ")
      .map((t, i) => (i !== 0 ? t.at(0)?.toUpperCase() + t.slice(1) : t))
      .join("") + ` ${index || index === 0 ? index : ""}`;

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
  }

  function handleRemoveImage() {
    setImgName("");
    setInputValue("");
  }

  return (
    <>
      <span>Image for the {type}: </span>
      <div className="w-fit flex flex-row gap-2 items-center">
        {imgName ? (
          <p>{imgName}</p>
        ) : (
          <input
            type="file"
            value={inputValue}
            name={cammeledImageTitle}
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
              if (onClickRemove) onClickRemove(cammeledImageTitle);
            }}
          >
            Remove
          </button>
        )}
      </div>
    </>
  );
}
