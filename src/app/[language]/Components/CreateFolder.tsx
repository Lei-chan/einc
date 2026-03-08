"use client";
// react
import { useActionState, useEffect, useRef, useState } from "react";
// next.js
import { usePathname } from "next/navigation";
// components
import PMessage from "./PMessage";
// action
import { createCollection } from "../../actions/auth/collections";
// method
import {
  getLanguageFromPathname,
  getMessagesFromFieldError,
  wait,
} from "../../lib/helper";
// type
import { FormStateCollection } from "../../lib/config/types/formState";

export default function CreateFolder({
  widthClassName,
  heightClassName,
  isVisible,
  onClickClose,
  handleSetIsUpdated,
}: {
  widthClassName: string;
  heightClassName: string;
  isVisible: boolean;
  onClickClose: () => void;
  handleSetIsUpdated: () => void;
}) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const transitionClassName = "transition-all duration-300";

  const [state, action, isPending] = useActionState<
    FormStateCollection,
    FormData
  >(createCollection, undefined);
  const lastHandledStateRef = useRef<FormStateCollection>(null);

  // use it to modify state
  // const [curState, setCurState] = useState(state);

  const [successMsg, setSuccessMsg] = useState("");

  // set curState as state to modify
  // useEffect(() => {
  //   (() => setCurState(state))();
  // }, [state]);

  useEffect(() => {
    const message = state?.message;
    if (!message || lastHandledStateRef.current === state) return;

    lastHandledStateRef.current = state;
    // const message = curState?.message;

    // if (!message) return;

    const displaySuccessMsg = async () => {
      setSuccessMsg(message[language]);
      await wait(2);
      setSuccessMsg("");
      handleSetIsUpdated();
      if (isVisible) onClickClose();
    };
    displaySuccessMsg();
  }, [
    state,
    // curState,
    language,
    isVisible,
    handleSetIsUpdated,
    onClickClose,
  ]);

  // // Reset error message when user closes the form
  useEffect(() => {
    if (!isVisible) lastHandledStateRef.current = null;
  }, [isVisible]);

  return (
    <form
      action={action}
      className={`${widthClassName} ${heightClassName} ${transitionClassName} absolute bottom-0 text-white text-center flex flex-col items-center z-10 ${isVisible ? "translate-y-0" : "translate-y-[100%]"}`}
    >
      {isPending && (
        <PMessage
          type="pending"
          message={
            language === "en"
              ? "Creating collection..."
              : "コレクション作成中..."
          }
        />
      )}
      {state?.errors && (
        <PMessage
          type="error"
          message={getMessagesFromFieldError(language, state.errors)}
        />
      )}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
      {successMsg && <PMessage type="success" message={successMsg} />}
      <div className="relative w-full h-full bg-black/60 backdrop-blur-sm flex flex-col items-center gap-3 p-3 mt-2">
        <button
          type="button"
          className={`${transitionClassName} absolute right-2 top-0 text-2xl hover:text-white/80`}
          onClick={onClickClose}
        >
          ×
        </button>
        <h2 className="text-lg">
          {language === "en" ? "Create Collection" : "コレクションを作成する"}
        </h2>
        <label>
          {language === "en" ? "Name of the collection" : "コレクションの名前"}
          <input
            name="name"
            placeholder={language === "en" ? "name" : "名前"}
            className={`mt-1  ${state?.errors?.name && "border-2 border-red-500"}`}
          ></input>
          {state?.errors?.name && (
            <p className="text-sm text-red-500">
              {state.errors.name[language]}
            </p>
          )}
        </label>
        <button
          className={`${transitionClassName} bg-orange-500 py-[1px] px-1 mt-1 rounded hover:bg-yellow-500`}
        >
          OK
        </button>
      </div>
    </form>
  );
}
