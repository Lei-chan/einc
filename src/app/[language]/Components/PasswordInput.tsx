"use client";
import { useState } from "react";
import { getWordFromCammelCase } from "../../lib/helper";
import ErrorMessageInput from "./ErrorMessageInput";
import {
  MIN_LENGTH_PASSWORD,
  MIN_NUMBER_EACH_PASSWORD,
} from "../../lib/config/settings";
import { Language } from "@/app/lib/config/type";

export default function PasswordInput({
  language,
  name = "password",
  classNameOptions,
  showExplanation,
  errorMessage,
}: {
  language: Language;
  name?: string;
  classNameOptions?: string;
  showExplanation: boolean;
  errorMessage: string[] | undefined;
}) {
  const buttonClassName =
    "absolute w-[10%] aspect-square bg-center bg-no-repeat bg-contain right-2";

  const [isVisible, setIsVisible] = useState(false);

  function handleToggleVisibility() {
    setIsVisible(!isVisible);
  }

  return (
    <div className="w-[12rem]">
      {showExplanation && (
        <p className="w-full text-sm text-left mb-2 leading-tight text-amber-800/90">
          {language === "en"
            ? `Please use more than ${MIN_LENGTH_PASSWORD} characters with at least ${MIN_NUMBER_EACH_PASSWORD} uppsercase letter, lowercase letter, and digit.`
            : `${MIN_LENGTH_PASSWORD}文字以上を使用し、大文字、小文字、数字をそれぞれ${MIN_NUMBER_EACH_PASSWORD}つ以上入れてください`}
        </p>
      )}
      <div className="relative w-full flex flex-row items-center">
        <input
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder={
            language === "en" ? getWordFromCammelCase(name) : "パスワード"
          }
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
    </div>
  );
}
