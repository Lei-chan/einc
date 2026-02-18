"use client";
// react
import { useActionState, useEffect, useState } from "react";
import { FormStateCollection } from "../lib/definitions";
import { createCollection } from "../actions/auth";
import { joinWithLineBreaks, wait } from "../lib/helper";
import PMessage from "./PMessage";

export default function CreateFolder({
  widthClassName,
  heightClassName,
  isVisible,
  onClickClose,
}: {
  widthClassName: string;
  heightClassName: string;
  isVisible: boolean;
  onClickClose: () => void;
}) {
  const transitionClassName = "transition-all duration-300";

  const [state, action, isPending] = useActionState<
    FormStateCollection,
    FormData
  >(createCollection, undefined);

  // use it to modify state
  const [curState, setCurState] = useState(state);
  const [successMsg, setSuccessMsg] = useState("");

  // set curState as state to modify
  useEffect(() => {
    (() => setCurState(state))();
  }, [state]);

  useEffect(() => {
    const message = curState?.message;
    if (message)
      (async () => {
        setSuccessMsg(message);
        await wait(2);
        setSuccessMsg("");
        if (isVisible) onClickClose();
      })();
  }, [curState, isVisible, onClickClose]);

  // Reset error message when user closes the form
  useEffect(() => {
    if (!isVisible) (() => setCurState(undefined))();
  }, [isVisible]);

  return (
    <form
      action={action}
      className={`${widthClassName} ${heightClassName} ${transitionClassName} absolute bottom-0 text-white text-center flex flex-col items-center z-10 ${isVisible ? "translate-y-0" : "translate-y-[100%]"}`}
    >
      {isPending && (
        <PMessage type="pending" message="Creating collection..." />
      )}
      {curState?.error && (
        <PMessage type="error" message={curState.error.message || ""} />
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
        <h2 className="text-lg">Create Folder</h2>
        <label>
          Name of the folder
          <input
            name="name"
            placeholder="name"
            className={`mt-1  ${state?.errors?.name && "border-2 border-red-500"}`}
          ></input>
          {state?.errors?.name && (
            <p className="text-sm text-red-500">
              {joinWithLineBreaks(state.errors.name)}
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
