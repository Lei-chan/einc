"use client";
// react
import { startTransition, useActionState, useEffect, useState } from "react";
// next.js
import { usePathname, useRouter } from "next/navigation";
// components
import Logo from "./LogoOnlineMark";
import ErrorMessageInput from "./ErrorMessageInput";
import PMessage from "./PMessage";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
// actions
import { signupViaGoogle, signupViaUserInfo } from "../../actions/auth/signup";
import { loginViaGoogle, loginViaUserInfo } from "../../actions/auth/login";
// methods
import { getError } from "../../lib/errorHandler";
import { getLanguageFromPathname } from "@/app/lib/helper";
// types
import {
  Language,
  DecodedGoogleCredential,
} from "../../lib/config/types/others";
import {
  ErrorFormState,
  FormStateAccount,
} from "../../lib/config/types/formState";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
// libraries
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function LoginSignUp({ type }: { type: "login" | "signUp" }) {
  const router = useRouter();
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
    if (err.error?.message) setError(err.error.message[language]);
  }

  return (
    <div className="relative w-full min-h-[100dvh] pt-1 flex flex-col items-center">
      <Logo showOnlineMark={false} />
      <div className="w-[18rem] sm:w-[22rem] xl:w-[23rem] 2xl:w-[24rem] h-screen flex flex-col items-center justify-center mt-4 xl:mt-0 mb-2 xl:mb-0">
        {(isPending || error) && (
          <PMessage
            type={isPending ? "pending" : "error"}
            message={isPending ? getPendingSentence() : error}
          />
        )}
        <div className="w-full h-fit bg-white/70 shadow-lg shadow-black/20 rounded mt-3 text-base py-3 xl:py-4">
          <ViaUserInfo
            language={language}
            router={router}
            typeToDisplay={typeToDisplay}
            typeToDisplayForLanguage={typeToDisplayForLanguage}
            handlePending={handlePending}
            handleError={handleError}
          />
          <ViaGoogle
            language={language}
            router={router}
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
  router,
  typeToDisplay,
  typeToDisplayForLanguage,
  handlePending,
  handleError,
}: {
  language: Language;
  router: AppRouterInstance;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const pClassName = "w-[12rem] text-left";

  const [state, action, isPending] = useActionState<
    FormStateAccount,
    { formData: FormData; language: Language }
  >(
    typeToDisplay === "Sign up" ? signupViaUserInfo : loginViaUserInfo,
    undefined,
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(() => action({ formData, language }));
  }

  useEffect(() => {
    handlePending(isPending);
  }, [handlePending, isPending]);

  useEffect(() => {
    if (!state) return;

    if (state.error) {
      handleError(state);
      return;
    }

    if (state.message) {
      router.push(`/${language}/main`);
    }
  }, [handleError, state, language, router]);

  return (
    <div className="w-full p-3 pb-1 border-b-2 flex flex-col items-center gap-3">
      {language === "en" ? (
        <p className="text-center">
          {typeToDisplayForLanguage} via email and password
        </p>
      ) : (
        <p className="text-center">
          メールアドレスとパスワードで
          <br />
          {typeToDisplayForLanguage}する
        </p>
      )}
      <form
        className="w-fit flex flex-col gap-1 items-center"
        onSubmit={handleSubmit}
      >
        <p className={pClassName}>
          {language === "en" ? "Email" : "メールアドレス"}
        </p>
        <EmailInput
          placeholder={language === "en" ? "email" : "メールアドレス"}
          defaultValue=""
          errorMessage={
            state?.errors?.email ? state.errors.email[language] : ""
          }
        />
        <p className={`${pClassName} mt-2`}>
          {language === "en" ? "Password" : "パスワード"}
        </p>
        <PasswordInput
          language={language}
          showExplanation={typeToDisplay === "Sign up" ? true : false}
          errorMessage={
            state?.errors?.password ? state.errors.password[language] : ""
          }
        />
        <button
          type="submit"
          className="w-fit text-sm text-white px-1 py-[1px] rounded mt-2 transition-all duration-150 bg-green-400 hover:bg-yellow-400"
        >
          {typeToDisplayForLanguage}
        </button>
      </form>
      <p className="opacity-70">{language === "en" ? "or" : "または"}</p>
    </div>
  );
}

function ViaGoogle({
  language,
  router,
  typeToDisplay,
  typeToDisplayForLanguage,
  handlePending,
  handleError,
}: {
  language: Language;
  router: AppRouterInstance;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  const [email, setEmail] = useState("");
  const [state, action, isPending] = useActionState<
    FormStateAccount,
    { email: string; language: Language }
  >(typeToDisplay === "Sign up" ? signupViaGoogle : loginViaGoogle, undefined);

  useEffect(() => {
    handlePending(isPending);
  }, [handlePending, isPending]);

  useEffect(() => {
    if (!state) return;

    if (state?.error) {
      handleError(state);
      return;
    }

    if (state.message) router.push(`/${language}/main`);
  }, [handleError, state, language, router]);
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
                  message: {
                    en: "Error. No credential provided.",
                    ja: "エラーが発生しました。クレデンシャルが与えられませんでした。",
                  },
                },
              });
            }

            const userCredential: DecodedGoogleCredential =
              jwtDecode(credential);

            const email = userCredential.email;
            if (!email) {
              console.error("Error. No email provided.");
              return handleError(getError("other"));
            }

            setEmail(email);

            // only if it's login => submit when user select an account
            if (typeToDisplay === "Log in")
              startTransition(() => action({ email, language }));
          } catch (err: unknown) {
            console.error("Error occured", err);
            return getError("other", undefined, err);
          }
        }}
        onError={() => {
          console.error(errorMessage);
          handleError(getError("other"));
        }}
      />
      {state?.errors?.email && (
        <ErrorMessageInput errorMessage={state.errors.email[language]} />
      )}
      {state?.errors?.password && (
        <ErrorMessageInput errorMessage={state.errors.password[language]} />
      )}
      {/* only when it's sign up, submit when user select an account and click the sign up button */}
      {typeToDisplay === "Sign up" && email && (
        <>
          <p className="text-center mt-4 leading-tight">
            {language === "en"
              ? "Please complete signing up"
              : "下のボタンをクリックして"}
            <br />
            {language === "en"
              ? "by clicking the button below"
              : "登録を完了してください"}
          </p>
          <button
            type="submit"
            className="transition-all duration-150 rounded bg-purple-500 hover:bg-pink-400 text-white px-1.5 py-[2px] text-sm mt-3"
            formAction={() =>
              startTransition(() => action({ email, language }))
            }
          >
            {language === "en" ? "Complete" : "完了"}
          </button>
        </>
      )}
    </form>
  );
}
