"use client";
// react
import { useActionState, useEffect, useState } from "react";
// components
import PasswordInput from "../Components/PasswordInput";
import EmailInput from "../Components/EmailInput";
import PMessage from "../Components/PMessage";
// actions
import { deleteAccount, updateEmail, updatePassword } from "../actions/auth";
// methods
import { getUser } from "../lib/dal";
import { formatDate, wait } from "../lib/helper";
// types
import { TYPE_USER } from "../lib/config/type";
import { ErrorFormState, FormStateAccount } from "../lib/definitions";

type TYPE_CLASSNAMES = {
  h3ClassName: string;
  pClassName: string;
  buttonClassName: string;
  buttonChangeClassName: string;
  buttonSubmitClassName: string;
};

export default function Account() {
  return (
    <div className="w-screen h-fit py-6 text-center flex flex-col items-center">
      <h1 className="text-xl ">Accound Information</h1>
      <UserInfo />
    </div>
  );
}

function UserInfo() {
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
    (async () => {
      const user = await getUser();
      if (user.error) setError(user.error.message);

      setUser(user);
    })();
  }, []);

  function displayError(err: ErrorFormState) {
    if (!err) return;

    setError(err?.error?.message || "");
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
          email={user?.email}
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
          displayPending={displayPending}
          displayError={displayError}
          displaySuccess={displaySuccess}
        />
        {!user?.isGoogleConnected && (
          <Password
            classNames={classNames}
            displayPending={displayPending}
            displayError={displayError}
            displaySuccess={displaySuccess}
          />
        )}
        <GoogleConnected
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
        />
        <MemberSince memberSince={user?.createdAt} classNames={classNames} />
        <CloseAccount
          classNames={classNames}
          displayPending={displayPending}
          displayError={displayError}
        />
      </div>
    </>
  );
}

function Email({
  email,
  isGoogleConnected,
  classNames,
  displayPending,
  displayError,
  displaySuccess,
}: {
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
    displayPending(isPending ? "Updating email..." : "");
  }, [isPending, displayPending]);

  // set curState as state to modify
  useEffect(() => {
    (() => setCurState(state))();
  }, [state]);

  // display error at the top of the page
  useEffect(() => {
    displayError(curState);

    // when update finished
    (() => {
      const newEmail = curState?.data?.email;
      if (!newEmail) return;

      setCurEmail(newEmail);
      setIsClicked(false);
      displaySuccess("Email updated");
      setCurState(undefined);
    })();
  }, [curState, displayError, displaySuccess]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>Email</h3>
      <p
        className={`${classNames.pClassName} overflow-hidden whitespace-nowrap text-ellipsis`}
      >
        {isClicked && (
          <span className="leading-none bg-blue-400 text-sm text-white rounded-sm px-1">
            Current email
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
            Change
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3 px-3">
            <p>Please enter your new email</p>
            <EmailInput
              placeholder="new email"
              defaultValue={curEmail || ""}
              errorMessage={state?.errors?.email}
            />
            <button type="submit" className={classNames.buttonSubmitClassName}>
              Submit
            </button>
          </div>
        ))}
    </form>
  );
}

function Password({
  classNames,
  displayPending,
  displayError,
  displaySuccess,
}: {
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
    displayPending(isPending ? "Updating password..." : "");
  }, [isPending, displayPending]);

  // set curState as state to modify
  useEffect(() => {
    (() => setCurState(state))();
  }, [state]);

  // display error at the top of the page
  useEffect(() => {
    displayError(curState);

    // when update finished
    (() => {
      const successMessage = curState?.message;
      if (!successMessage) return;

      setIsClicked(false);
      displaySuccess(successMessage);
      setCurState(undefined);
    })();
  }, [curState, displayError, displaySuccess]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>Password</h3>
      {!isClicked ? (
        <button
          type="button"
          className={`${classNames.buttonChangeClassName}`}
          onClick={handleClickChange}
        >
          Change
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 p-3">
          <p>Please enter your current password</p>
          <PasswordInput
            name="currentPassword"
            errorMessage={state?.errors?.curPassword}
          />
          <p>Please enter your new password</p>
          <PasswordInput
            name="newPassword"
            errorMessage={state?.errors?.newPassword || state?.errors?.password}
          />
          <button
            type="submit"
            className={`${classNames.buttonClassName} mt-2 bg-green-500 hover:bg-yellow-500`}
          >
            Submit
          </button>
        </div>
      )}
    </form>
  );
}

function GoogleConnected({
  isGoogleConnected,
  classNames,
}: {
  isGoogleConnected: boolean | undefined;
  classNames: TYPE_CLASSNAMES;
}) {
  return (
    <div>
      <h3 className={classNames.h3ClassName}>Google Connection</h3>
      <p className={classNames.pClassName}>
        {isGoogleConnected !== undefined && (
          <span>{isGoogleConnected ? "Connected" : "Not connected"}</span>
        )}
      </p>
    </div>
  );
}

function MemberSince({
  memberSince,
  classNames,
}: {
  memberSince: string | undefined;
  classNames: TYPE_CLASSNAMES;
}) {
  return (
    <div>
      <h3 className={classNames.h3ClassName}>Member Since</h3>
      <p className={classNames.pClassName}>
        {memberSince && formatDate(memberSince, "en-US", true)}
      </p>
    </div>
  );
}

function CloseAccount({
  classNames,
  displayPending,
  displayError,
}: {
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
    displayPending(isPending ? "Closing account..." : "");
  }, [isPending, displayPending]);

  // display error at the top of the page
  useEffect(() => {
    displayError(state);
  }, [state, displayError]);

  return (
    <form action={action}>
      <h3 className={classNames.h3ClassName}>Close Account</h3>
      {!isClicked ? (
        <button
          type="button"
          className={`${classNames.buttonClassName} bg-red-500 hover:bg-red-400`}
          onClick={handleClickClose}
        >
          Close
        </button>
      ) : (
        <>
          <p className={`${classNames.pClassName} text-red-600 leading-tight`}>
            ※ Once you close your accound, you can not undo this action.
          </p>
          <button
            type="submit"
            className={`${classNames.buttonClassName} bg-red-600 hover:bg-red-400 mt-0`}
          >
            I understand
          </button>
        </>
      )}
    </form>
  );
}
