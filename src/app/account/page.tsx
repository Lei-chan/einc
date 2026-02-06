"use client";
import { useState } from "react";
import { getUserDev } from "../lib/helper";
import PasswordInput from "../Components/PasswordInput";
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

  // for dev
  const accessToken = "iiii";
  const user = getUserDev(accessToken);
  if (!user) {
    console.error("User Not Found!");
    return;
  }

  return (
    <div className="w-[90%] h-fit bg-slate-50 rounded my-6 shadow-md shadow-black/20 overflow-hidden">
      <Email
        email={user.email}
        isGoogleConnected={user.isGoogleConnected}
        classNames={classNames}
      />
      {user.password && <Password classNames={classNames} />}
      <GoogleConnected
        isGoogleConnected={user.isGoogleConnected}
        classNames={classNames}
      />
      <MemberSince memberSince={user.createdAt} classNames={classNames} />
      <CloseAccount classNames={classNames} />
    </div>
  );
}

// add error next!!
function Email({
  email,
  isGoogleConnected,
  classNames,
}: {
  email: string;
  isGoogleConnected: boolean;
  classNames: TYPE_CLASSNAMES;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [value, setValue] = useState(email);

  function handleClickChange() {
    setIsClicked(true);
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setValue(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedValue = value.trim();
    console.log(trimmedValue);
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
        &nbsp;&nbsp;{email}
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
          <div className="flex flex-col items-center gap-3">
            <p>Please enter your new email</p>
            <input
              type="email"
              placeholder="new email"
              value={value}
              className="w-[12rem]"
              onChange={handleChangeInput}
            ></input>
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

  function handleClickChange() {
    setIsClicked(true);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const currentPassword = String(formData.get("currentPassword")).trim();
    const newPassword = String(formData.get("newPassword")).trim();

    console.log(currentPassword, newPassword);
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
        <div className="flex flex-col items-center gap-3 py-3">
          <p>Please enter your current password</p>
          <PasswordInput name="currentPassword" />
          <p>Please enter your new password</p>
          <PasswordInput name="newPassword" />
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
  isGoogleConnected: boolean;
  classNames: TYPE_CLASSNAMES;
}) {
  return (
    <div>
      <h3 className={classNames.h3ClassName}>Google Connection</h3>
      <p className={classNames.pClassName}>
        {isGoogleConnected ? "Connected" : "Not connected"}
      </p>
    </div>
  );
}

function MemberSince({
  memberSince,
  classNames,
}: {
  memberSince: string;
  classNames: TYPE_CLASSNAMES;
}) {
  return (
    <div>
      <h3 className={classNames.h3ClassName}>Member Since</h3>
      <p className={classNames.pClassName}>{memberSince}</p>
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
