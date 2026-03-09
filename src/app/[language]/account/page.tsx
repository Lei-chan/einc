"use client";
// react
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
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
  getMessagesFromFieldError,
  wait,
} from "../../lib/helper";
// types
import { FormStateAccount } from "../../lib/config/types/formState";
import { usePathname, useRouter } from "next/navigation";
import {
  DisplayMessage,
  Language,
  UserData,
} from "@/app/lib/config/types/others";

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
    <div className="w-full min-h-[100dvh] py-6 text-center flex flex-col items-center justify-center">
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

  const [user, setUser] = useState<UserData>();
  const [pendingMsg, setPendingMsg] = useState("");
  const [state, setState] = useState<FormStateAccount>();
  const [messageData, setMessageData] = useState<DisplayMessage>();

  const lastHandledStateRef = useRef<FormStateAccount>(null);

  // fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (!user)
        setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });

      setUser(user);
    };
    fetchUser();
  }, [language]);

  function displayPending(pendingMessage: string) {
    setPendingMsg(pendingMessage);
  }

  function handleStateChange(state: FormStateAccount) {
    if (!state || lastHandledStateRef.current === state) return;

    setState(state);
  }

  useEffect(() => {
    if (!state?.message) return;

    const displayMessage = async () => {
      if (!state.message) return;

      setMessageData({ type: "success", message: state.message[language] });
      await wait();
      setMessageData(undefined);
    };
    displayMessage();
  }, [state?.message, language]);

  return (
    <>
      <div className="w-full h-fit my-2 flex flex-col items-center">
        {messageData && (
          <PMessage type={messageData.type} message={messageData.message} />
        )}
        {pendingMsg && <PMessage type="pending" message={pendingMsg} />}
        {state?.error?.message && (
          <PMessage type="error" message={state.error.message[language]} />
        )}
        {state?.errors && (
          <PMessage
            type="error"
            message={getMessagesFromFieldError(language, state.errors)}
          />
        )}
      </div>
      <div
        className={`w-[18rem] sm:w-[19rem] md:w-[20rem] lg:w-[22rem] xl:w-[25rem] 2xl:w-[27rem] h-fit bg-slate-50 rounded mb-6 shadow-md shadow-black/20 overflow-hidden ${!user ? "animate-pulse" : "animation-none"}`}
      >
        <Email
          language={language}
          email={user?.email}
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
          displayPending={displayPending}
          handleStateChange={handleStateChange}
        />
        {!user?.isGoogleConnected && (
          <Password
            language={language}
            classNames={classNames}
            displayPending={displayPending}
            handleStateChange={handleStateChange}
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
          handleStateChange={handleStateChange}
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
  handleStateChange,
}: {
  language: Language;
  email: string | undefined;
  isGoogleConnected: boolean | undefined;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  handleStateChange: (state: FormStateAccount) => void;
}) {
  const [curEmail, setCurEmail] = useState(email);
  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    updateEmail,
    undefined,
  );

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
  }, [isPending, language, displayPending]);

  useEffect(() => {
    handleStateChange(state);
  }, [state, handleStateChange]);

  // display error at the top of the page
  useEffect(() => {
    // when update finished
    const handleUpdateFinished = () => {
      const newEmail = state?.data?.email;
      if (!newEmail) return;

      setCurEmail(newEmail);
      setIsClicked(false);
    };
    handleUpdateFinished();
  }, [state?.data?.email, language]);

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
  handleStateChange,
}: {
  language: Language;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  handleStateChange: (state: FormStateAccount) => void;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    updatePassword,
    undefined,
  );

  function handleClickChange() {
    setIsClicked(true);
  }

  useEffect(() => {
    handleStateChange(state);
  }, [state, handleStateChange]);

  // display pending state at the top of the page
  useEffect(() => {
    if (isPending)
      displayPending(
        language === "en" ? "Updating password..." : "パスワードを更新中...",
      );
    if (!isPending) displayPending("");
  }, [isPending, language, displayPending]);

  // display error at the top of the page
  useEffect(() => {
    // when update finished
    const handleUpdateFinished = () => {
      const successMessage = state?.message;
      if (!successMessage) return;

      setIsClicked(false);
    };
    handleUpdateFinished();
  }, [state?.message, language]);

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
  handleStateChange,
}: {
  language: Language;
  classNames: TYPE_CLASSNAMES;
  displayPending: (pendingMsg: string) => void;
  handleStateChange: (state: FormStateAccount) => void;
}) {
  const router = useRouter();

  const [isClicked, setIsClicked] = useState(false);
  const [state, action, isPending] = useActionState<FormStateAccount, FormData>(
    deleteAccount,
    undefined,
  );

  function handleClickClose() {
    setIsClicked(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(() => action(new FormData(e.currentTarget)));

    router.push(`/${language}/account-closed`);
  }

  // display pending state at the top of the page
  useEffect(() => {
    if (isPending)
      displayPending(language === "en" ? "Closing account..." : "退会中...");
    if (!isPending) displayPending("");
  }, [isPending, language, displayPending]);

  useEffect(() => {
    handleStateChange(state);
  }, [state, handleStateChange]);

  return (
    <form onSubmit={handleSubmit}>
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
