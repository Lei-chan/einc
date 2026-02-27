"use client";
import Dictionary from "@/app/Components/Dictionary";
import { MILLISECONDS_A_DAY } from "@/app/lib/config/settings";
import { TYPE_JOURNAL_DATA_TO_DISPLAY } from "@/app/lib/config/type";
import { formatDate, joinWithLineBreaks } from "@/app/lib/helper";
import {
  checkIsDateToday,
  getJournalDataDate,
  getJournalDataMonth,
} from "@/app/lib/logics/journal";
import journals from "@/app/ModelsDev/UserJournal";
import React, { JSX, use, useEffect, useRef, useState } from "react";

export default function Journal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="w-screen h-screen">
      <Top />
      <Middle collectionId={id} />
    </div>
  );
}

function Top() {
  return (
    <h1 className="w-full h-[10%] text-2xl text-white bg-gradient-to-t from-amber-800 to-amber-700 tracking-wide py-2 shadow-sm shadow-black/40 text-center">
      Journal
    </h1>
  );
}

function Middle({ collectionId }: { collectionId: string }) {
  const arrowButtonClassName =
    "w-5 aspect-square bg-[url('/icons/arrow.svg')] bg-no-repeat bg-center bg-contain";

  const [date, setDate] = useState<Date | string>(new Date());
  const [journalDataMonth, setJournalDataMonth] =
    useState<TYPE_JOURNAL_DATA_TO_DISPLAY[]>();
  const [journalDataDate, setJournalDataDate] =
    useState<TYPE_JOURNAL_DATA_TO_DISPLAY>();
  const [journalToDisplay, setJournalToDisplay] = useState<string[]>();
  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);
  const [isContentEditableFocused, setIsContentEditableFocused] =
    useState(false);

  function handleToggleDictionary() {
    setIsDectionaryOpen(!isDictionaryOpen);
  }

  function handleChangeDate(e: React.MouseEvent<HTMLButtonElement>) {
    const name = e.currentTarget.name;

    // set new date
    setDate((prev) => {
      const prevTimeStamp = new Date(prev).getTime();
      const newTimeStamp =
        name === "prev"
          ? prevTimeStamp - MILLISECONDS_A_DAY
          : prevTimeStamp + MILLISECONDS_A_DAY;

      return new Date(newTimeStamp);
    });
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;
    console.log(value);

    setJournalToDisplay(value.split("\n"));
  }

  function handleToggleFocusContentEditable() {
    setIsContentEditableFocused(!isContentEditableFocused);
  }

  function handleBlurContentEditable(e: React.FocusEvent<HTMLTextAreaElement>) {
    handleToggleFocusContentEditable();
    const target = e.currentTarget;
    const value = target.value.split("\n");

    // send data to server
    setJournalDataDate({ ...journalDataDate, content: value, date });
    setJournalToDisplay(value);
  }

  useEffect(() => {
    (() => {
      const journalDate = getJournalDataDate(collectionId, date);

      setJournalDataDate(journalDate);
      setJournalToDisplay(journalDate ? journalDate.content : undefined);
    })();
  }, [collectionId, date]);

  return (
    <div className={`w-full h-[90%] pt-3 gap-3 items-center flex flex-col`}>
      <div
        className={`w-[90%] overflow-y-auto my-3 ${!isDictionaryOpen ? "flex-[1.7]" : "flex-1"}`}
      >
        <div className="flex flex-row justify-center gap-10">
          <button
            name="prev"
            className={`${arrowButtonClassName} rotate-180`}
            onClick={handleChangeDate}
          ></button>
          <p className="text-center">
            {formatDate(new Date(date), "en-US", true)}
          </p>
          <button
            name="next"
            className={`${arrowButtonClassName} ${checkIsDateToday(date) ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
            onClick={handleChangeDate}
          ></button>
        </div>
        <textarea
          suppressContentEditableWarning={true}
          value={journalToDisplay ? journalToDisplay.join("\n") : ""}
          className="w-full aspect-[1/1.5] mt-3 p-1 text-sm bg-transparent border-none resize-none"
          onChange={handleChangeTextarea}
          onFocus={handleToggleFocusContentEditable}
          onBlur={handleBlurContentEditable}
        ></textarea>
      </div>
      {!isDictionaryOpen ? (
        <div className="flex-[0.3] flex flex-col justify-center">
          <button
            className="w-fit h-fit bg-green-400 hover:bg-green-300 text-white px-2 rounded"
            onClick={handleToggleDictionary}
          >
            Search words with dictionary
          </button>
        </div>
      ) : (
        <div className="relative overflow-y-auto flex-1">
          <button
            className="absolute font-bold top-[2px] right-2 text-sm hover:text-amber-700"
            onClick={handleToggleDictionary}
          >
            &#10005;
          </button>
          <Dictionary widthClassName="w-screen" heightClassName="h-full" />
        </div>
      )}
    </div>
  );
}
