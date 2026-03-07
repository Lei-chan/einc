"use client";
// react
import { useActionState, useEffect, useState } from "react";
// components
import PasswordInput from "../Components/PasswordInput";
import EmailInput from "../Components/EmailInput";
import PMessage from "../Components/PMessage";
// actions
import {
  deleteAccount,
  updateEmail,
  updatePassword,
} from "../../actions/auth/account";
// methods
import { getUser } from "../../lib/dal";
import {
  formatDate,
  getGenericErrorMessage,
  getLanguageFromPathname,
  wait,
} from "../../lib/helper";
// types
import { Language, TYPE_USER } from "../../lib/config/type";
import { ErrorFormState, FormStateAccount } from "../../lib/definitions";
import { usePathname } from "next/navigation";

type TYPE_CLASSNAMES = {
  h3ClassName: string;
  pClassName: string;
  buttonClassName: string;
  buttonChangeClassName: string;
  buttonSubmitClassName: string;
};

export default function Account() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-screen h-fit py-6 text-center flex flex-col items-center">
      <h1 className="text-xl ">
        {language === "en" ? "Accound Information" : "アカウント情報"}
      </h1>
      <UserInfo language={language} />
    </div>
  );
}

function UserInfo({ language }: { language: Language }) {
  const buttonClassName =
    "w-fit h-fit transition-all duration-150 text-sm text-white leading-none rounded p-[5px] my-4";
  const classNames = {
    h3ClassName: "text-lg bg-green-200 px-3 py-1",
    pClassName: "mx-3 my-5",
    buttonClassName,
    buttonChangeClassName: `${buttonClassName}  bg-orange-500 hover:bg-yellow-500`,
    buttonSubmitClassName: `${buttonClassName} mt-2 bg-green-500 hover:bg-yellow-500`,
  };

  const [user, setUser] = useState<TYPE_USER>();
  const [pendingMsg, setPendingMsg] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (!user) setError(getGenericErrorMessage(language));

      setUser(user);
    };
    fetchUser();
  }, [language]);

  function displayError(err: ErrorFormState) {
    if (!err) return;

    if (err.error?.message) setError(err.error.message[language]);
  }

  function displayPending(pendingMessage: string) {
    setPendingMsg(pendingMessage);
  }

  async function displaySuccess(successMessage: string) {
    setSuccessMsg(successMessage);
    await wait();
    setSuccessMsg("");
  }

  return (
    <>
      <div className="w-full h-fit my-2 flex flex-col items-center">
        {pendingMsg && <PMessage type="pending" message={pendingMsg} />}
        {error && <PMessage type="error" message={error} />}
        {successMsg && <PMessage type="success" message={successMsg} />}
      </div>
      <div
        className={`w-[90%] h-fit bg-slate-50 rounded mb-6 shadow-md shadow-black/20 overflow-hidden ${!user ? "animate-pulse" : "animation-none"}`}
      >
        <Email
          language={language}
          email={user?.email}
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
          displayPending={displayPending}
          displayError={displayError}
          displaySuccess={displaySuccess}
        />
        {!user?.isGoogleConnected && (
          <Password
            language={language}
            classNames={classNames}
            displayPending={displayPending}
            displayError={displayError}
            displaySuccess={displaySuccess}
          />
        )}
        <GoogleConnected
          language={language}
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
        />
        <MemberSince
          language={language}
          memberSince={user?.createdAt}
          classNames={classNames}
        />
        <CloseAccount
          language={language}
          classNames={classNames}
          displayPending={displayPending}
          displayError={displayError}
        />
      </div>
    </>
  );
}

function Email({
  language,
  email,
  isGoogleConnected,
  classNames,
  displayPending,
  displayError,
  displaySuccess,
}: {
  language: Language;
  email: string | undefined;
  isGoogleConnected: boolean | undefined;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  displayError: (error: ErrorFormState) => void;
  displaySuccess: (successMessage: string) => void;
}) {
  const [curEmail, setCurEmail] = useState(email);
  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    updateEmail,
    undefined,
  );
  // use this to modify state
  const [curState, setCurState] = useState(state);

  function handleClickChange() {
    setIsClicked(true);
  }

  // set user email as curEmail when it's fetched
  useEffect(() => {
    setCurEmail(email);
  }, [email]);

  // display pending state at the top of the page
  useEffect(() => {
    if (isPending)
      displayPending(
        language === "en" ? "Updating email..." : "メールアドレスを更新中...",
      );
    if (!isPending) displayPending("");
  }, [isPending, displayPending]);

  // set curState as state to modify
  useEffect(() => {
    const setCurrentState = () => setCurState(state);
    setCurrentState();
  }, [state]);

  // display error at the top of the page
  useEffect(() => {
    displayError(curState);

    // when update finished
    const updateFinished = () => {
      const newEmail = curState?.data?.email;
      if (!newEmail) return;

      setCurEmail(newEmail);
      setIsClicked(false);
      displaySuccess(
        language === "en"
          ? "Email updated successfully"
          : "メールアドレスが更新されました",
      );
      setCurState(undefined);
    };
    updateFinished();
  }, [curState, language, displayError, displaySuccess]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>
        {language === "en" ? "Email" : "メールアドレス"}
      </h3>
      <p
        className={`${classNames.pClassName} overflow-hidden whitespace-nowrap text-ellipsis`}
      >
        {isClicked && (
          <span className="leading-none bg-blue-400 text-sm text-white rounded-sm px-1">
            {language === "en" ? "Current email" : "現在のメールアドレス"}
          </span>
        )}
        &nbsp;&nbsp;{curEmail}
      </p>
      {!isGoogleConnected &&
        (!isClicked ? (
          <button
            type="button"
            className={`${classNames.buttonChangeClassName} mt-0`}
            onClick={handleClickChange}
          >
            {language === "en" ? "Change" : "変更"}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 px-3">
            <p>
              {language === "en"
                ? "Please enter your new email"
                : "新しいメールアドレスを入力してください"}
            </p>
            <EmailInput
              placeholder={
                language === "en" ? "new email" : "新しいメールアドレス"
              }
              defaultValue={curEmail || ""}
              errorMessage={
                state?.errors?.email ? state.errors.email[language] : ""
              }
            />
            <button type="submit" className={classNames.buttonSubmitClassName}>
              {language === "en" ? "Submit" : "更新"}
            </button>
          </div>
        ))}
    </form>
  );
}

function Password({
  language,
  classNames,
  displayPending,
  displayError,
  displaySuccess,
}: {
  language: Language;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  displayError: (error: ErrorFormState) => void;
  displaySuccess: (successMessage: string) => void;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    updatePassword,
    undefined,
  );
  // use this to modify state
  const [curState, setCurState] = useState(state);

  function handleClickChange() {
    setIsClicked(true);
  }

  // display pending state at the top of the page
  useEffect(() => {
    if (isPending)
      displayPending(
        language === "en" ? "Updating password..." : "パスワードを更新中...",
      );
    if (!isPending) displayPending("");
  }, [isPending, language, displayPending]);

  // I'm gonna change it
  // set curState as state to modify
  useEffect(() => {
    (() => setCurState(state))();
  }, [state]);

  // display error at the top of the page
  useEffect(() => {
    displayError(curState);

    // when update finished
    const handleUpdateFinished = () => {
      const successMessage = curState?.message;
      if (!successMessage) return;

      setIsClicked(false);
      displaySuccess(successMessage[language]);
      setCurState(undefined);
    };
    handleUpdateFinished();
  }, [curState, language, displayError, displaySuccess]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>
        {language === "en" ? "Password" : "パスワード"}
      </h3>
      {!isClicked ? (
        <button
          type="button"
          className={`${classNames.buttonChangeClassName}`}
          onClick={handleClickChange}
        >
          {language === "en" ? "Change" : "変更"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 p-3">
          <p>
            {language === "en"
              ? "Please enter your current password"
              : "現在のパスワードを入力してください"}
          </p>
          <PasswordInput
            language={language}
            name="currentPassword"
            showExplanation={false}
            errorMessage={
              state?.errors?.curPassword
                ? state.errors.curPassword[language]
                : ""
            }
          />
          <p>
            {language === "en"
              ? "Please enter your new password"
              : "新しいパスワードを入力してください"}
          </p>
          <PasswordInput
            language={language}
            name="newPassword"
            showExplanation={true}
            errorMessage={
              state?.errors?.newPassword
                ? state.errors.newPassword[language]
                : state?.errors?.password
                  ? state.errors.password[language]
                  : ""
            }
          />
          <button
            type="submit"
            className={`${classNames.buttonClassName} mt-2 bg-green-500 hover:bg-yellow-500`}
          >
            {language === "en" ? "Submit" : "更新"}
          </button>
        </div>
      )}
    </form>
  );
}

function GoogleConnected({
  language,
  isGoogleConnected,
  classNames,
}: {
  language: Language;
  isGoogleConnected: boolean | undefined;
  classNames: TYPE_CLASSNAMES;
}) {
  return (
    <div>
      <h3 className={classNames.h3ClassName}>
        {language === "en" ? "Google Connection" : "Google連携"}
      </h3>
      <p className={classNames.pClassName}>
        {isGoogleConnected !== undefined && (
          <span>
            {isGoogleConnected &&
              (language === "en" ? "Connected" : "連携済み")}{" "}
            {!isGoogleConnected &&
              (language === "en" ? "Not connected" : "連携されていません")}
          </span>
        )}
      </p>
    </div>
  );
}

function MemberSince({
  language,
  memberSince,
  classNames,
}: {
  language: Language;
  memberSince: string | undefined;
  classNames: TYPE_CLASSNAMES;
}) {
  const [userLocale, setUserLocale] = useState("en-US");

  useEffect(() => {
    const getUserLocale = () => setUserLocale(navigator.language);
    getUserLocale();
  }, []);
  return (
    <div>
      <h3 className={classNames.h3ClassName}>
        {language === "en" ? "Member Since" : "登録日"}
      </h3>
      <p className={classNames.pClassName}>
        {memberSince && formatDate(memberSince, userLocale, true)}
      </p>
    </div>
  );
}

function CloseAccount({
  language,
  classNames,
  displayPending,
  displayError,
}: {
  language: Language;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  displayError: (error: ErrorFormState) => void;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    deleteAccount,
    undefined,
  );

  function handleClickClose() {
    setIsClicked(true);
  }

  // display pending state at the top of the page
  useEffect(() => {
    if (isPending)
      displayPending(language === "en" ? "Closing account..." : "退会中...");
    if (!isPending) displayPending("");
  }, [isPending, displayPending]);

  // display error at the top of the page
  useEffect(() => {
    displayError(state);
  }, [state, displayError]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>
        {language === "en" ? "Close Account" : "退会する"}
      </h3>
      {!isClicked ? (
        <button
          type="button"
          className={`${classNames.buttonClassName} bg-red-500 hover:bg-red-400`}
          onClick={handleClickClose}
        >
          {language === "en" ? "Close" : "退会"}
        </button>
      ) : (
        <>
          <p className={`${classNames.pClassName} text-red-600 leading-tight`}>
            ※{" "}
            {language === "en"
              ? "Once you close your accound, you can not undo this action."
              : "一度退会してしまうと、取り消しはできません"}
          </p>
          <button
            type="submit"
            className={`${classNames.buttonClassName} bg-red-600 hover:bg-red-400 mt-0`}
          >
            {language === "en" ? "I understand" : "理解しました"}
          </button>
        </>
      )}
    </form>
  );
}
