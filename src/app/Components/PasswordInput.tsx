"use client";
import { useState } from "react";

export default function PasswordInput() {
  const buttonClassName =
    "absolute w-[10%] aspect-square bg-center bg-no-repeat bg-contain right-2";

  const [isVisible, setIsVisible] = useState(false);

  function handleToggleVisibility() {
    setIsVisible(!isVisible);
  }

  return (
    <div className="relative w-[12rem] flex flex-row items-center mt-1">
      <input
        type={isVisible ? "text" : "password"}
        placeholder="password"
        className="w-full text-base"
      />
      {!isVisible ? (
        <button
          className={`${buttonClassName} bg-[url('/icons/eye-off.svg')]`}
          onClick={handleToggleVisibility}
        ></button>
      ) : (
        <button
          className={`${buttonClassName} bg-[url('/icons/eye.svg')]`}
          onClick={handleToggleVisibility}
        />
      )}
    </div>
  );
}
