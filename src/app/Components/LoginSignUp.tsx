"use client";
// react
import { useActionState, useEffect, useState } from "react";
// components
import Logo from "./Logo";
import {
  loginViaGoogle,
  loginViaUserInfo,
  signupViaGoogle,
  signupViaUserInfo,
} from "../actions/auth";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { TYPE_DECODED_GOOGLE_CREDENTIAL } from "../lib/config/type";
import ErrorMessageInput from "./ErrorMessageInput";
import { ErrorFormState, FormState } from "../lib/definitions";
import { getError } from "../lib/errorHandler";

export default function LoginSignUp({ type }: { type: "login" | "signUp" }) {
  const typeToDisplay = type === "login" ? "Log in" : "Sign up";
  const messageClassName = "py-1 px-2 rounded";
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  function handlePending(isPending: boolean) {
    setIsPending(isPending);
  }

  function handleError(err: ErrorFormState) {
    if (!err) return;

    setIsPending(false);
    setError(err?.error?.message || "");
  }

  return (
    <div className="relative w-screen h-screen pt-1">
      <Logo />
      <div className="w-full h-full flex flex-col justify-center items-center text-center">
        {(isPending || error) && (
          <div className="w-[90%] text-center text-white shadow-md shadow-black/10  leading-tight text-sm">
            {isPending ? (
              <p className={`${messageClassName} bg-purple-400 `}>
                {type === "login" ? "Loging in..." : "Creating your accound..."}
              </p>
            ) : (
              <p className={`${messageClassName} bg-red-500`}>{error}</p>
            )}
          </div>
        )}
        <div className="w-[90%] h-fit bg-white/70 shadow-lg shadow-black/20 rounded-md mt-3 text-base py-3">
          <ViaUserInfo
            typeToDisplay={typeToDisplay}
            handlePending={handlePending}
            handleError={handleError}
          />
          <ViaGoogle
            typeToDisplay={typeToDisplay}
            handlePending={handlePending}
            handleError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

function ViaUserInfo({
  typeToDisplay,
  handlePending,
  handleError,
}: {
  typeToDisplay: "Log in" | "Sign up";
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const pClassName = "w-[12rem] text-left";
  const [state, action, pending] = useActionState<FormState, FormData>(
    typeToDisplay === "Sign up" ? signupViaUserInfo : loginViaUserInfo,
    undefined,
  );

  useEffect(() => {
    handlePending(pending);
  }, [pending]);

  useEffect(() => {
    if (!state?.error) return;

    handleError(state);
  }, [state?.error]);

  return (
    <div className="w-full p-3 pb-1 border-b-2 flex flex-col items-center gap-3">
      <p>{typeToDisplay} via email and password</p>
      <form className="w-fit flex flex-col gap-1 items-center" action={action}>
        <p className={pClassName}>Email</p>
        <EmailInput
          placeholder="email"
          defaultValue=""
          errorMessage={state?.errors?.email}
        />
        <p className={`${pClassName} mt-2`}>Password</p>
        <PasswordInput errorMessage={state?.errors?.password} />
        <input name="isGoogleConnected" defaultValue={"false"} hidden></input>
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

function ViaGoogle({
  typeToDisplay,
  handlePending,
  handleError,
}: {
  typeToDisplay: "Log in" | "Sign up";
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  const [email, setEmail] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(
    typeToDisplay === "Sign up" ? signupViaGoogle : loginViaGoogle,
    undefined,
  );

  useEffect(() => {
    handlePending(pending);
  }, [pending]);

  useEffect(() => {
    if (!state?.error) return;

    handleError(state);
  }, [state?.error]);
  return (
    <form action={action} className="w-full p-3 flex flex-col items-center">
      <p className="mb-3">{typeToDisplay} via Google</p>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const credential = credentialResponse.credential;

            if (!credential) {
              console.error("Error. No credential provided.");
              return handleError({
                error: {
                  status: 401,
                  message: "Error. No credential provided.",
                },
              });
            }

            const userCredential: TYPE_DECODED_GOOGLE_CREDENTIAL =
              jwtDecode(credential);

            const email = userCredential.email;
            if (!email) {
              console.error("Error. No email provided.");
              return handleError(getError("other"));
            }

            setEmail(email);
          } catch (err: unknown) {
            console.error("Error occured", err);
            return getError("other", "", err);
          }
        }}
        onError={() => {
          console.error(errorMessage);
          handleError(getError("other"));
        }}
      />
      <input name="email" value={email} hidden readOnly></input>
      <input name="isGoogleConnected" defaultValue={"true"} hidden></input>
      {state?.errors?.email && (
        <ErrorMessageInput errorMessage={state?.errors?.email} />
      )}
      {state?.errors?.password && (
        <ErrorMessageInput errorMessage={state?.errors?.password} />
      )}
      {email && (
        <button
          type="submit"
          className="transition-all duration-150 rounded bg-purple-500 hover:bg-pink-400 text-white px-1 py-[1px] text-sm mt-4"
        >
          {typeToDisplay}
        </button>
      )}
    </form>
  );
}
