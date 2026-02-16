"use client";
import { useEffect, useState } from "react";
import { formatDate, getInputErrorMessage, getUserDev } from "../lib/helper";
import PasswordInput from "../Components/PasswordInput";
import EmailInput from "../Components/EmailInput";
import { getUser } from "../lib/dal";
import PErrorMessage from "../Components/PErrorMessage";
import { TYPE_USER } from "../lib/config/type";
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
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user.error) setError(user.error.message);

      setUser(user);
    })();
  }, []);

  return (
    <>
      <div className="max-w-[90%] my-2">
        {error && <PErrorMessage error={error} />}
      </div>
      <div
        className={`w-[90%] h-fit bg-slate-50 rounded mb-6 shadow-md shadow-black/20 overflow-hidden ${!user ? "animate-pulse" : "animation-none"}`}
      >
        <Email
          email={user?.email}
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
        />
        {!user?.isGoogleConnected && <Password classNames={classNames} />}
        <GoogleConnected
          isGoogleConnected={user?.isGoogleConnected}
          classNames={classNames}
        />
        <MemberSince memberSince={user?.createdAt} classNames={classNames} />
        <CloseAccount classNames={classNames} />
      </div>
    </>
  );
}

function Email({
  email,
  isGoogleConnected,
  classNames,
}: {
  email: string | undefined;
  isGoogleConnected: boolean | undefined;
  classNames: TYPE_CLASSNAMES;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleClickChange() {
    setIsClicked(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = new FormData(e.currentTarget).get("email");
    const trimmedValue = String(value).trim();

    const errorMessage = getInputErrorMessage(trimmedValue, "email", email);

    if (errorMessage) return setErrorMessage(errorMessage);

    // send data to server
    console.log(trimmedValue);
    setErrorMessage("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className={classNames.h3ClassName}>Email</h3>
      <p
        className={`${classNames.pClassName} overflow-hidden whitespace-nowrap text-ellipsis`}
      >
        {isClicked && (
          <span className="leading-none bg-blue-400 text-sm text-white rounded-sm px-1">
            Current email
          </span>
        )}
        &nbsp;&nbsp;{email && email}
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
              defaultValue={email || ""}
              errorMessage={[errorMessage]}
            />
            <button type="submit" className={classNames.buttonSubmitClassName}>
              Submit
            </button>
          </div>
        ))}
    </form>
  );
}

function Password({ classNames }: { classNames: TYPE_CLASSNAMES }) {
  const [isClicked, setIsClicked] = useState(false);
  const [errorMessageCurrent, setErrorMessageCurrent] = useState("");
  const [errorMessageNew, setErrorMessageNew] = useState("");

  function handleClickChange() {
    setIsClicked(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const currentPassword = String(formData.get("currentPassword")).trim();
    const newPassword = String(formData.get("newPassword")).trim();

    const errorMsgCurrent = getInputErrorMessage(currentPassword, "password");
    const errorMsgNew = getInputErrorMessage(
      newPassword,
      "password",
      currentPassword,
    );

    if (errorMsgCurrent || errorMsgNew) {
      setErrorMessageCurrent(errorMsgCurrent);
      setErrorMessageNew(errorMsgNew);
      return;
    }

    // send data to server
    setErrorMessageCurrent("");
    setErrorMessageNew("");
  }

  return (
    <form onSubmit={handleSubmit}>
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
            errorMessage={[errorMessageCurrent]}
          />
          <p>Please enter your new password</p>
          <PasswordInput name="newPassword" errorMessage={[errorMessageNew]} />
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

function CloseAccount({ classNames }: { classNames: TYPE_CLASSNAMES }) {
  const [isClicked, setIsClicked] = useState(false);

  function handleClickClose() {
    setIsClicked(true);
  }

  function handleClickUnderstand() {
    console.log("Account Closed!");
  }

  return (
    <div>
      <h3 className={classNames.h3ClassName}>Close Account</h3>
      {!isClicked ? (
        <button
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
            className={`${classNames.buttonClassName} bg-red-600 hover:bg-red-400 mt-0`}
            onClick={handleClickUnderstand}
          >
            I understand
          </button>
        </>
      )}
    </div>
  );
}
