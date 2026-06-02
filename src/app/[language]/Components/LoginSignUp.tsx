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
import { getError, isError } from "../../lib/errorHandler";
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
} from "@/app/lib/helper";
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
import Link from "next/link";
import LinkPrivacyPolicy from "./LinkPrivacyPolicy";
import { createIndexedDBDatabase } from "@/app/lib/indexedDB/create";

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

  const [isPolicyAgreed, setIsPolicyAgreed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>("");

  function handleToggleCheckbox() {
    setIsPolicyAgreed(!isPolicyAgreed);
  }

  function handlePending(isPending: boolean) {
    setIsPending(isPending);
  }

  function handleError(err: ErrorFormState) {
    if (!err) return;

    setIsPending(false);
    if (err.error?.message) setError(err.error.message[language]);
  }

  return (
    <div className="relative w-full min-h-[100dvh] pt-1 flex flex-col items-center justify-center">
      <Logo showOnlineMark={false} topClassName="top-1" />
      <div
        className={`w-[18rem] sm:w-[22rem] xl:w-[23rem] 2xl:w-[24rem] h-full flex flex-col items-center justify-center ${type === "login" ? "mb-4" : "mb-2"}`}
      >
        <h1 className="text-xl lg:text-2xl m-2 text-orange-600 font-bold tracking-wider">
          {typeToDisplayForLanguage}
        </h1>
        {(isPending || error) && (
          <PMessage
            type={isPending ? "pending" : "error"}
            message={isPending ? getPendingSentence() : error}
          />
        )}
        {type === "signUp" && (
          <div className="flex flex-row gap-3 my-2">
            <input
              name="privacyPolicy"
              type="checkbox"
              className="w-4 cursor-pointer"
              checked={isPolicyAgreed}
              onChange={handleToggleCheckbox}
            ></input>
            <p className="leading-tight">
              {language === "en" ? "I agree to " : "こちらの"}
              <LinkPrivacyPolicy textSizeClassName="text-sm" />
              {language === "ja" && "に同意します"}
            </p>
          </div>
        )}
        <div className="w-full h-fit bg-white/70 shadow-lg shadow-black/20 rounded text-base py-3 xl:py-4">
          <ViaUserInfo
            language={language}
            router={router}
            typeToDisplay={typeToDisplay}
            typeToDisplayForLanguage={typeToDisplayForLanguage}
            isPolicyAgreed={isPolicyAgreed}
            handlePending={handlePending}
            handleError={handleError}
          />
          <ViaGoogle
            language={language}
            router={router}
            typeToDisplay={typeToDisplay}
            typeToDisplayForLanguage={typeToDisplayForLanguage}
            isPolicyAgreed={isPolicyAgreed}
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
  isPolicyAgreed,
  handlePending,
  handleError,
}: {
  language: Language;
  router: AppRouterInstance;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  isPolicyAgreed: boolean;
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
    // try {
    e.preventDefault();

    if (typeToDisplay === "Sign up" && !isPolicyAgreed) {
      handleError({
        error: {
          message: {
            en: "Please agree to the privacy policy to finish signing up",
            ja: "登録を完了するためにプライバシーポリシーへの同意をしてください",
          },
        },
      });
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(() => action({ formData, language }));
    // } catch (err) {
    //   console.error("Error", err);
    //   handleError({
    //     error: {
    //       message: {
    //         en: "Unexpected local database error 🙇‍♂️ Please try again this later",
    //         ja: "予期せぬローカルデータベースのエラーが発生しました🙇‍♂️後ほどもう一度お試しください",
    //       },
    //     },
    //   });
    // }
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

    const handleSuccess = async () => {
      try {
        // Create database in indexedDB
        await createIndexedDBDatabase();

        router.push(`/${language}/main`);
      } catch (err) {
        console.error("Error", err);
        handleError({
          error: {
            message: {
              en: "Unexpected local database error 🙇‍♂️ Please try again this later",
              ja: "予期せぬローカルデータベースのエラーが発生しました🙇‍♂️後ほどもう一度お試しください",
            },
          },
        });
      }
    };

    if (state.message) handleSuccess();
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
  isPolicyAgreed,
  handlePending,
  handleError,
}: {
  language: Language;
  router: AppRouterInstance;
  typeToDisplay: "Log in" | "Sign up";
  typeToDisplayForLanguage: string;
  isPolicyAgreed: boolean;
  handlePending: (isPending: boolean) => void;
  handleError: (error: ErrorFormState) => void;
}) {
  const errorMessage = `${typeToDisplay} Failed. Please try this later or try another mathod.`;

  const [email, setEmail] = useState("");
  const [state, action, isPending] = useActionState<
    FormStateAccount,
    { email: string; language: Language }
  >(typeToDisplay === "Sign up" ? signupViaGoogle : loginViaGoogle, undefined);

  function handleSubmit(data: { email: string; language: Language }) {
    // try {
    if (typeToDisplay === "Sign up" && !isPolicyAgreed) {
      handleError({
        error: {
          message: {
            en: "Please agree to the privacy policy to finish signing up",
            ja: "登録を完了するためにプライバシーポリシーへの同意をしてください",
          },
        },
      });
      return;
    }

    startTransition(() => action(data));
    // } catch (err) {
    //   console.error("Error", err);
    //   handleError({
    //     error: {
    //       message: {
    //         en: "Unexpected local database error 🙇‍♂️ Please try again this later",
    //         ja: "予期せぬローカルデータベースのエラーが発生しました🙇‍♂️後ほどもう一度お試しください",
    //       },
    //     },
    //   });
    // }
  }

  useEffect(() => {
    handlePending(isPending);
  }, [handlePending, isPending]);

  useEffect(() => {
    if (!state) return;

    if (state?.error) {
      handleError(state);
      return;
    }

    const handleSuccess = async () => {
      try {
        // Create database in indexedDB
        await createIndexedDBDatabase();

        router.push(`/${language}/main`);
      } catch (err) {
        console.error("Error", err);
        handleError({
          error: {
            message: {
              en: "Unexpected local database error 🙇‍♂️ Please try again this later",
              ja: "予期せぬローカルデータベースのエラーが発生しました🙇‍♂️後ほどもう一度お試しください",
            },
          },
        });
      }
    };

    if (state.message) handleSuccess();
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

            handleSubmit({ email, language });
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
    </form>
  );
}
