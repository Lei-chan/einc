import { useState } from "react";

export default function AudioWord({
  onClickRemove,
}: {
  onClickRemove?: () => void;
}) {
  const [inputValue, setInputValue] = useState("");

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.currentTarget.value);
  }

  function handleRemoveAudio() {
    setInputValue("");
  }

  return (
    <>
      <div className="w-fit flex flex-row gap-2 items-center">
        <span>Audio:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <input
          type="file"
          value={inputValue}
          name="audio"
          accept="audio/*"
          className="w-[60%] border-none my-1 p-0 text-sm cursor-pointer rounded-none"
          onChange={handleChangeInput}
        ></input>
        {inputValue && (
          <button
            type="button"
            className="h-fit bg-purple-800 text-white px-1 py-[2px] rounded text-xs"
            onClick={handleRemoveAudio}
          >
            Remove
          </button>
        )}
      </div>
    </>
  );
}
