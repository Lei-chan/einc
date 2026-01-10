"use client";
import { useState } from "react";
import Logo from "./Logo";
import PasswordInput from "./PasswordInput";

export default function LoginSignUp({ type }: { type: "login" | "signUp" }) {
  const [error, setError] = useState("");

  return (
    <div className="relative w-screen h-screen pt-1">
      <Logo />
      <div className="w-full h-full flex flex-col justify-center items-center">
        {error && (
          <p className="w-[90%] bg-orange-600 text-center text-white shadow-md shadow-black/10 rounded py-1 px-2 leading-tight text-sm">
            {error}
          </p>
        )}
        <div className="w-[90%] h-fit bg-white/70 shadow-lg shadow-black/20 rounded-md mt-3 text-base">
          <ViaNameEmail type={type} />
          <ViaGoogle type={type} />
        </div>
      </div>
    </div>
  );
}

function ViaNameEmail({ type }: { type: "login" | "signUp" }) {
  return (
    <div className="w-full p-3 pb-1 border-b-2 flex flex-col items-center gap-3">
      <p>{type === "login" ? "Log in" : "Sign up"} via username and password</p>
      <div className="w-fit">
        <p>Username</p>
        <input type="text" placeholder="username" className="w-[12rem] mt-1" />
        <p className="mt-3">Password</p>
        <PasswordInput />
      </div>
      <p className="opacity-70">or</p>
    </div>
  );
}

function ViaGoogle({ type }: { type: "login" | "signUp" }) {
  return (
    <div className="w-full p-3">
      {/* I will do it later */}
      <p>{type === "login" ? "Log in" : "Sign up"} via Google</p>
    </div>
  );
}
