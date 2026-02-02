"use client";
import { useState } from "react";
import Logo from "./Logo";
import PasswordInput from "./PasswordInput";
import ViaGoogle from "./ViaGoogle";

export default function LoginSignUp({ type }: { type: "login" | "signUp" }) {
  const [error, setError] = useState("");

  const typeToDisplay = type === "login" ? "Log in" : "Sign up";

  function displayError(error: string) {
    setError(error);
  }

  return (
    <div className="relative w-screen h-screen pt-1">
      <Logo />
      <div className="w-full h-full flex flex-col justify-center items-center text-center">
        {error && (
          <p className="w-[90%] bg-orange-600 text-center text-white shadow-md shadow-black/10 rounded py-1 px-2 leading-tight text-sm">
            {error}
          </p>
        )}
        <div className="w-[90%] h-fit bg-white/70 shadow-lg shadow-black/20 rounded-md mt-3 text-base py-3">
          <ViaNameEmail
            typeToDisplay={typeToDisplay}
            displayError={displayError}
          />
          <ViaGoogle
            typeToDisplay={typeToDisplay}
            displayError={displayError}
          />
        </div>
      </div>
    </div>
  );
}

function ViaNameEmail({
  typeToDisplay,
  displayError,
}: {
  typeToDisplay: "Log in" | "Sign up";
  displayError: (error: string) => void;
}) {
  const pClassName = "w-full text-left";
  const errorInputClassName = "border-2 border-red-300";
  const [fieldsHaveError, setFieldsHaveError] = useState({
    email: false,
    password: false,
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formDataArray = [...new FormData(e.currentTarget)];
    const [emailValue, passwordValue] = formDataArray.map((array) =>
      String(array[1]).trim(),
    );

    // Set error
    setFieldsHaveError({
      ...fieldsHaveError,
      email: !emailValue,
      password: !passwordValue,
    });
    if (!emailValue || !passwordValue)
      return displayError("※ Please fill the field below");
  }

  console.log(fieldsHaveError);

  return (
    <div className="w-full p-3 pb-1 border-b-2 flex flex-col items-center gap-3">
      <p>{typeToDisplay} via email and password</p>
      <form
        className="w-fit flex flex-col gap-1 items-center"
        onSubmit={handleSubmit}
      >
        <p className={pClassName}>Email</p>
        <input
          name="email"
          type="email"
          placeholder="email"
          className={`w-[12rem] ${fieldsHaveError.email ? errorInputClassName : ""}`}
        />
        <p className={`${pClassName} mt-2`}>Password</p>
        <PasswordInput
          classNameOptions={fieldsHaveError.password ? errorInputClassName : ""}
        />
        <button
          type="submit"
          className="w-fit text-sm text-white px-1 py-[1px] rounded mt-2 transition-all duration-150 bg-green-400 hover:bg-yellow-400"
        >
          {typeToDisplay}
        </button>
      </form>
      <p className="opacity-70">or</p>
    </div>
  );
}
