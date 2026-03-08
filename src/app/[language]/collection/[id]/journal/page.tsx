"use client";
// react
import {
  startTransition,
  use,
  useActionState,
  useEffect,
  useState,
} from "react";
// next.js
import { usePathname } from "next/navigation";
// components
import Dictionary from "@/app/[language]/Components/Dictionary";
import PMessage from "@/app/[language]/Components/PMessage";
// action
import { addUpdateJournal } from "@/app/actions/auth/journal";
// methods
import { getJournalDataDate } from "@/app/lib/dal";
import {
  areDatesSame,
  formatDate,
  getGenericErrorMessage,
  getLanguageFromPathname,
  isObjectEmpty,
} from "@/app/lib/helper";
// settings
import { MILLISECONDS_A_DAY } from "@/app/lib/config/settings";
// types

import { FormStateWordJournal } from "@/app/lib/config/types/formState";
import { JournalDatabase, Language } from "@/app/lib/config/types/others";

export default function Journal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-screen h-screen">
      <Top language={language} />
      <Middle language={language} collectionId={id} />
    </div>
  );
}

function Top({ language }: { language: Language }) {
  return (
    <h1 className="w-full h-[10%] text-2xl text-white bg-gradient-to-t from-amber-800 to-amber-700 tracking-wide py-2 shadow-sm shadow-black/40 text-center">
      {language === "en" ? "Journal" : "ジャーナル"}
    </h1>
  );
}

function Middle({
  language,
  collectionId,
}: {
  language: Language;
  collectionId: string;
}) {
  const arrowButtonClassName =
    "w-5 aspect-square bg-[url('/icons/arrow.svg')] bg-no-repeat bg-center bg-contain";

  const [date, setDate] = useState<Date | string>(new Date().toISOString());
  const [journalDataDate, setJournalDataDate] = useState<JournalDatabase>({
    _id: "",
    collectionId,
    journal: {
      date: "",
      content: [],
    },
  });
  const journalContent = journalDataDate.journal.content;

  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);
  const [isContentEditableFocused, setIsContentEditableFocused] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [state, action] = useActionState<FormStateWordJournal, JournalDatabase>(
    addUpdateJournal,
    undefined,
  );

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

      return new Date(newTimeStamp).toISOString();
    });
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.currentTarget.value;

    setJournalDataDate((prev) => {
      const newData = { ...prev };
      newData.journal.content = value.split("\n");
      return newData;
    });
  }

  function handleToggleFocusContentEditable() {
    setIsContentEditableFocused(!isContentEditableFocused);
  }

  function handleBlurContentEditable() {
    handleToggleFocusContentEditable();

    const { journal, ...others } = journalDataDate;

    startTransition(() =>
      action({ journal: { date, content: journal.content }, ...others }),
    );
  }

  useEffect(() => {
    const fetchJournalForDate = async () => {
      const journalDate = await getJournalDataDate(collectionId, date);
      if (!journalDate) {
        setErrorMessage(getGenericErrorMessage(language));
        return;
      }

      // if object is empty => set a default data, otherwise => set a real data
      setJournalDataDate(
        isObjectEmpty(journalDate)
          ? {
              _id: "",
              collectionId,
              journal: {
                date: "",
                content: [],
              },
            }
          : journalDate,
      );
    };

    fetchJournalForDate();
  }, [collectionId, date, language]);

  return (
    <div className={`w-full h-[90%] pt-3 gap-3 items-center flex flex-col`}>
      {errorMessage && <PMessage type="error" message={errorMessage} />}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
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
            className={`${arrowButtonClassName} ${areDatesSame(new Date(), date) ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
            onClick={handleChangeDate}
          ></button>
        </div>
        <textarea
          suppressContentEditableWarning={true}
          value={journalContent.length > 0 ? journalContent.join("\n") : ""}
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
            {language === "en"
              ? "Search words with dictionary"
              : "辞書で単語を検索する"}
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
