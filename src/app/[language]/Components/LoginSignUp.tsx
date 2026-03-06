"use client";
// react
import { startTransition, useActionState, useEffect, useState } from "react";
// components
import Logo from "./Logo";
import ErrorMessageInput from "./ErrorMessageInput";
import PMessage from "./PMessage";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
// methods
import { getError } from "../../lib/errorHandler";
// types
import {
  Language,
  TYPE_DECODED_GOOGLE_CREDENTIAL,
} from "../../lib/config/type";
import { ErrorFormState, FormStateAccount } from "../../lib/definitions";
// libraries
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { signupViaGoogle, signupViaUserInfo } from "../../actions/auth/signup";
import { loginViaGoogle, loginViaUserInfo } from "../../actions/auth/login";
import { usePathname } from "next/navigation";
import { getLanguageFromPathname } from "@/app/lib/helper";

export default function LoginSignUp({ type }: { type: "login" | "signUp" }) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const typeToDisplay = type === "login" ? "Log in" : "Sign up";
  const typeToDisplayForLanguage =
    language === "en"
      ? typeToDisplay
      : typeToDisplay === "Log in"
        ? "ログイン"
        : "登録";

  const getPendingSentence = () => {
    if (language === "en")
      return type === "login" ? "Loging in..." : "Creating account...";

    return type === "login" ? "ログイン中..." : "アカウント作成中...";
  };

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>("");

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
      <div className="w-full h-full flex flex-col justify-center items-center text-center my-6">
        {(isPending || error) && (
          <PMessage
            type={isPending ? "pending" : "error"}
            message={isPending ? getPendingSentence() : error}
          />
        )}
        <div className="w-[90%] h-fit bg-white/70 shadow-lg shadow-black/20 rounded-md mt-3 text-base py-3">
          <ViaUserInfo
            language={language}
            typeToDisplay={typeToDisplay}
            typeToDisplayForLanguage={typeToDisplayForLanguage}
            handlePending={handlePending}
            handleError={handleError}
          />
          <ViaGoogle
            language={language}
            typeToDisplay={typeToDisplay}
            typeToDisplayForLanguage={typeToDisplayForLanguage}
            handlePending={handlePending}
            handleError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

function ViaUserInfo({
  language,
  typeToDisplay,
  typeToDisplayForLanguage,
  handlePending,
  handleError,
}: {
  language: Language;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const pClassName = "w-[12rem] text-left";

  const [state, action, pending] = useActionState<FormStateAccount, FormData>(
    typeToDisplay === "Sign up" ? signupViaUserInfo : loginViaUserInfo,
    undefined,
  );

  useEffect(() => {
    handlePending(pending);
  }, [handlePending, pending]);

  useEffect(() => {
    if (!state?.error) return;

    handleError(state);
  }, [handleError, state]);

  return (
    <div className="w-full p-3 pb-1 border-b-2 flex flex-col items-center gap-3">
      {language === "en" ? (
        <p>{typeToDisplayForLanguage} via email and password</p>
      ) : (
        <p>
          メールアドレスとパスワードで
          <br />
          {typeToDisplayForLanguage}する
        </p>
      )}
      <form className="w-fit flex flex-col gap-1 items-center" action={action}>
        <p className={pClassName}>
          {language === "en" ? "Email" : "メールアドレス"}
        </p>
        <EmailInput
          placeholder={language === "en" ? "email" : "メールアドレス"}
          defaultValue=""
          errorMessage={state?.errors?.email}
        />
        <p className={`${pClassName} mt-2`}>
          {language === "en" ? "Password" : "パスワード"}
        </p>
        <PasswordInput
          language={language}
          showExplanation={typeToDisplay === "Sign up" ? true : false}
          errorMessage={state?.errors?.password}
        />
        <button
          type="submit"
          className="w-fit text-sm text-white px-1 py-[1px] rounded mt-2 transition-all duration-150 bg-green-400 hover:bg-yellow-400"
        >
          {typeToDisplayForLanguage}
        </button>
      </form>
      <p className="opacity-70">or</p>
    </div>
  );
}

function ViaGoogle({
  language,
  typeToDisplay,
  typeToDisplayForLanguage,
  handlePending,
  handleError,
}: {
  language: Language;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  const [email, setEmail] = useState("");
  const [state, action, pending] = useActionState<FormStateAccount, string>(
    typeToDisplay === "Sign up" ? signupViaGoogle : loginViaGoogle,
    undefined,
  );

  useEffect(() => {
    handlePending(pending);
  }, [handlePending, pending]);

  useEffect(() => {
    if (!state?.error) return;

    handleError(state);
  }, [handleError, state]);
  return (
    <form className="w-full p-3 flex flex-col items-center">
      <p className="mb-3">
        {language === "en"
          ? `${typeToDisplay} via Google`
          : `Googleアカウントで${typeToDisplayForLanguage}する`}
      </p>
      <p className="text-sm mb-2">
        {language === "en"
          ? "Please select your account"
          : "アカウントを選択してください"}
      </p>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const credential = credentialResponse.credential;

            if (!credential) {
              console.error("Error. No credential provided.");
              return handleError({
                error: {
                  status: 401,
                  message:
                    language === "en"
                      ? "Error. No credential provided."
                      : "エラーが発生しました。クレデンシャルが与えられませんでした。",
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

            // only if it's login => submit when user select an account
            if (typeToDisplay === "Log in")
              startTransition(() => action(email));
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
      {state?.errors?.email && (
        <ErrorMessageInput errorMessage={state?.errors?.email} />
      )}
      {state?.errors?.password && (
        <ErrorMessageInput errorMessage={state?.errors?.password} />
      )}
      {/* only when it's sign up, submit when user select an account and click the sign up button */}
      {typeToDisplay === "Sign up" && email && (
        <button
          type="submit"
          className="transition-all duration-150 rounded bg-purple-500 hover:bg-pink-400 text-white px-1 py-[1px] text-sm mt-4"
          formAction={() => startTransition(() => action(email))}
        >
          {typeToDisplayForLanguage}
        </button>
      )}
    </form>
  );
}
