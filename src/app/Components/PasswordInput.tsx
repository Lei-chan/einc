"use client";
import { useState } from "react";
import { getWordFromCammelCase } from "../lib/helper";

export default function PasswordInput({
  name = "password",
  classNameOptions,
}: {
  name?: string;
  classNameOptions?: string;
}) {
  const buttonClassName =
    "absolute w-[10%] aspect-square bg-center bg-no-repeat bg-contain right-2";

  const [isVisible, setIsVisible] = useState(false);

  function handleToggleVisibility() {
    setIsVisible(!isVisible);
  }

  return (
    <div className="relative w-[12rem] flex flex-row items-center">
      <input
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={getWordFromCammelCase(name)}
        className={`w-full text-base ${classNameOptions}`}
      />
      {!isVisible ? (
        <button
          type="button"
          className={`${buttonClassName} bg-[url('/icons/eye-off.svg')]`}
          onClick={handleToggleVisibility}
        ></button>
      ) : (
        <button
          type="button"
          className={`${buttonClassName} bg-[url('/icons/eye.svg')]`}
          onClick={handleToggleVisibility}
        />
      )}
    </div>
  );
}
