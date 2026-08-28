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
import ButtonGoBack from "@/app/[language]/Components/ButtonGoBack";
// action
import { addUpdateJournal } from "@/app/actions/auth/journal";
// methods
import { getJournalDataDate } from "@/app/lib/dal";
import {
  areDatesSame,
  formatDate,
  getGenericErrorMessage,
  getLanguageFromPathname,
  getMessagesFromFieldError,
  isObjectEmpty,
} from "@/app/lib/helper";
// settings
import { MILLISECONDS_A_DAY } from "@/app/lib/config/settings";
// types
import { FormStateWordJournal } from "@/app/lib/config/types/formState";
import { JournalDatabase, Language } from "@/app/lib/config/types/others";
import { useMessage } from "@/app/lib/contexts/messageContext";

export default function Journal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);

  function handleToggleDictionary() {
    setIsDectionaryOpen(!isDictionaryOpen);
  }

  return (
    <div className="w-screen h-[100dvh]">
      <Top language={language} />
      <Middle
        language={language}
        collectionId={id}
        isDictionaryOpen={isDictionaryOpen}
        onClickDictionary={handleToggleDictionary}
      />
      {!isDictionaryOpen && (
        <ButtonGoBack language={language} navigateTo="previous" />
      )}
    </div>
  );
}

function Top({ language }: { language: Language }) {
  return (
    <h1 className="w-full h-fit text-2xl text-white bg-gradient-to-t from-amber-800 to-amber-700 tracking-wide shadow-sm shadow-black/40 text-center py-2">
      {language === "en" ? "Journal" : "ジャーナル"}
    </h1>
  );
}

function Middle({
  language,
  collectionId,
  isDictionaryOpen,
  onClickDictionary,
}: {
  language: Language;
  collectionId: string;
  isDictionaryOpen: boolean;
  onClickDictionary: () => void;
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
  const { showMessage } = useMessage();

  const journalContent = journalDataDate.journal.content;

  const [isContentEditableFocused, setIsContentEditableFocused] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [state, action] = useActionState<FormStateWordJournal, JournalDatabase>(
    addUpdateJournal,
    undefined,
  );

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

  async function handleBlurContentEditable() {
    handleToggleFocusContentEditable();

    const { journal, ...others } = journalDataDate;

    addUpdateJournal(undefined, {
      journal: { date, content: journal.content },
      ...others,
    })
      .then((result) => {
        if (!result) {
          showMessage("error", getGenericErrorMessage(language));
          console.error("Error: Journal content is invalid");
          return;
        }

        if ("error" in result && result.error.message) {
          showMessage("error", result.error.message[language]);
          return;
        }

        if ("errors" in result && result.errors) {
          showMessage(
            "error",
            getMessagesFromFieldError(language, result.errors),
          );
          return;
        }

        if ("message" in result && result.message)
          showMessage("success", result.message[language]);
      })
      .catch((err) => {
        console.error("Error", err);
        showMessage("error", getGenericErrorMessage(language));
      });

    // startTransition(() =>
    //   action(),
    // );
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
    <div
      className={`w-full h-[90%] pt-3 lg:pt-4 xl:pt-5 2xl:pt-6 gap-3 items-center flex flex-col`}
    >
      {errorMessage && <PMessage type="error" message={errorMessage} />}
      {state?.errors && (
        <PMessage
          type="error"
          message={getMessagesFromFieldError(language, state.errors)}
        />
      )}
      {state?.error?.message && (
        <PMessage type="error" message={state.error.message[language]} />
      )}
      <div
        className={`w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] overflow-y-auto my-3 ${!isDictionaryOpen ? "flex-[1.7]" : "flex-[0.8]"}`}
      >
        <div className="flex flex-row justify-center gap-10">
          <button
            data-testid="btnPrev"
            name="prev"
            className={`${arrowButtonClassName} rotate-180`}
            onClick={handleChangeDate}
          ></button>
          <p data-testid="date" className="text-center">
            {formatDate(new Date(date), language, true)}
          </p>
          <button
            data-testid="btnNext"
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
            data-testid="btnOpenDict"
            className="w-fit h-fit bg-green-400 hover:bg-green-300 text-white px-2 rounded"
            onClick={onClickDictionary}
          >
            {language === "en"
              ? "Search words with dictionary"
              : "辞書で単語を検索する"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-end overflow-y-auto overflow-x-hidden flex-[1.2] w-full h-full">
          <button
            data-testid="btnCloseDict"
            className="text-sm hover:text-amber-700 mr-1 transition-all duration-500 translate-x-[90%] hover:translate-x-0"
            onClick={onClickDictionary}
          >
            &#10005; {language === "en" ? "Close Dictionary" : "辞書を閉じる"}
          </button>
          <Dictionary widthClassName="w-full" heightClassName="h-full" />
        </div>
      )}
    </div>
  );
}
