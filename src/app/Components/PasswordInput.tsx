"use client";
import { useState } from "react";
import { getWordFromCammelCase } from "../lib/helper";
import ErrorMessageInput from "./ErrorMessageInput";

export default function PasswordInput({
  name = "password",
  classNameOptions,
  errorMessage,
}: {
  name?: string;
  classNameOptions?: string;
  errorMessage: string[] | undefined;
}) {
  const buttonClassName =
    "absolute w-[10%] aspect-square bg-center bg-no-repeat bg-contain right-2";

  const [isVisible, setIsVisible] = useState(false);

  function handleToggleVisibility() {
    setIsVisible(!isVisible);
  }

  return (
    <>
      <div className="relative w-[12rem] flex flex-row items-center">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={getWordFromCammelCase(name)}
          className={`w-full text-base ${classNameOptions} ${errorMessage && "border-2 border-red-500"}`}
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
      {errorMessage && <ErrorMessageInput errorMessage={errorMessage} />}
    </>
  );
}
