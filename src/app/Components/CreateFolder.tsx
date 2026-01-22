"use client";
import { useEffect, useState } from "react";

export default function CreateFolder({
  widthClassName,
  heightClassName,
  isVisible,
  onClickClose,
}: {
  widthClassName: string;
  heightClassName: string;
  isVisible: boolean;
  onClickClose: () => void;
}) {
  const transitionClassName = "transition-all duration-300";
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name")).trim();

    if (!name) return setError("Folder name is empty");

    console.log(name);
  }

  // Reset error message
  useEffect(() => {
    const setErrorMsg = (msg: string) => setError(msg);
    if (!isVisible) setErrorMsg("");
  }, [isVisible]);

  return (
    <form
      className={`${widthClassName} ${heightClassName} ${transitionClassName} absolute bottom-0 text-white text-center ${isVisible ? "translate-y-0" : "translate-y-[100%]"}`}
      onSubmit={handleSubmit}
    >
      <div className="relative w-full h-full bg-black/60 backdrop-blur-sm flex flex-col items-center gap-3 p-3">
        {error && (
          <p
            className={`absolute bg-orange-600 -top-7 text-[15px] px-1 mx-2 rounded-sm`}
          >
            {error}
          </p>
        )}
        <button
          type="button"
          className={`${transitionClassName} absolute right-2 top-0 text-2xl hover:text-white/80`}
          onClick={onClickClose}
        >
          ×
        </button>
        <h2 className="text-lg">Create Folder</h2>
        <label>
          Name of the folder
          <input
            name="name"
            placeholder="name"
            className={`mt-1  ${error && "border-2 border-red-500"}`}
          ></input>
        </label>
        <button
          className={`${transitionClassName} bg-orange-500 py-[1px] px-1 mt-1 rounded hover:bg-yellow-500`}
        >
          OK
        </button>
      </div>
    </form>
  );
}
