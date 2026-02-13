"use client";
import { useState } from "react";
import ErrorMessageInput from "./ErrorMessageInput";

export default function EmailInput({
  placeholder,
  defaultValue,
  errorMessage,
}: {
  placeholder: string;
  defaultValue: string;
  errorMessage: string[] | undefined;
}) {
  const [value, setValue] = useState(defaultValue);

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setValue(value);
  }
  return (
    <>
      <input
        name="email"
        type="email"
        placeholder={placeholder}
        value={value}
        className={`w-[12rem] ${errorMessage && "border-2 border-red-500"}`}
        onChange={handleChangeInput}
      ></input>
      {errorMessage && <ErrorMessageInput errorMessage={errorMessage} />}
    </>
  );
}
