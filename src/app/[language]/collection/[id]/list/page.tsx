"use client";
// react
import {
  startTransition,
  use,
  useActionState,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
// next.js
import { usePathname } from "next/navigation";
// components
import ButtonPagination from "@/app/[language]/Components/ButtonPagination";
import WordCard from "@/app/[language]/Components/WordCard";
import PMessage from "@/app/[language]/Components/PMessage";
// reducer
import { paginationReducer } from "@/app/lib/reducers";
// action
import { deleteWords } from "@/app/actions/auth/words";
// dal
// import { getMatchedWordsCurPage } from "@/app/lib/dal"；
import { getMatchedWordsCurPage } from "@/app/lib/indexedDB/database";
// methods
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getNumberOfPages,
  isArrayEmpty,
  wait,
} from "@/app/lib/helper";
// settings
import { LISTS_ONE_PAGE } from "@/app/lib/config/settings";
// type

import { FormStateWordJournal } from "@/app/lib/config/types/formState";
import {
  ActionPaginationType,
  CheckedDataList,
  DisplayMessage,
  Language,
  WordData,
} from "@/app/lib/config/types/others";
import { IsOnline } from "@/app/lib/hooks";

export default function List({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  // states
  const [searchValue, setSearchValue] = useState("");
  const [numberOfMatchedWords, setNumberOfMatchedWords] = useState(0);
  const [words, setWords] = useState<WordData[] | undefined>();
  const [curPage, dispatch] = useReducer(paginationReducer, 1);
  // use resetKey to fetch data again
  const [resetKey, setResetKey] = useState(0);
  const [messageData, setMessageData] = useState<DisplayMessage>();

  function handleUpdateUI() {
    setResetKey((prev) => prev + 1);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const value = String(formData.get("word")).trim();
    setSearchValue(value);

    // reset curPage to 1
    dispatch("reset");
  }

  useEffect(() => {
    const setWordsNumberOfPages = async () => {
      // set numberOfPages by matchedWords
      const wordData = await getMatchedWordsCurPage(id, searchValue, curPage);

      if (!wordData) {
        setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });
        return;
      }

      setNumberOfMatchedWords(wordData.numberOfMatchedWords);

      setWords(wordData.matchedWordsCurPage);
    };

    setWordsNumberOfPages();
  }, [id, searchValue, curPage, resetKey, language]);

  return (
    <div
      className={`w-full h-fit flex flex-col items-center ${messageData ? "gap-3" : ""}`}
    >
      <SearchBar language={language} onSubmitSearch={handleSubmit} />
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      <Bottom
        language={language}
        collectionId={id}
        data={words}
        numberOfWords={numberOfMatchedWords}
        curPage={curPage}
        handleUpdateUI={handleUpdateUI}
        dispatch={dispatch}
      />
    </div>
  );
}

function SearchBar({
  language,
  onSubmitSearch,
}: {
  language: Language;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="w-full h-20 bg-gradient-to-l from-orange-300 to-yellow-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-2 lg:gap-3 xl:gap-5"
      onSubmit={onSubmitSearch}
    >
      <input
        name="word"
        type="search"
        placeholder={language === "en" ? "search by word" : "単語名で探す"}
        className="w-[14rem] sm:w-[18rem] lg:w-[20rem] xl:w-[21rem] 2xl:w-[22rem] h-[40%] rounded-full px-3"
      ></input>
      <button
        type="submit"
        className="text-sm xl:text-base text-white bg-green-400/80 px-1 py-[2px] rounded shadow shadow-black/10"
      >
        {language === "en" ? "Search" : "検索"}
      </button>
    </form>
  );
}

function Bottom({
  language,
  collectionId,
  data,
  numberOfWords,
  curPage,
  handleUpdateUI,
  dispatch,
}: {
  language: Language;
  collectionId: string;
  data: WordData[] | undefined;
  numberOfWords: number;
  curPage: number;
  handleUpdateUI: () => void;
  dispatch: (action: ActionPaginationType) => void;
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [areWordsChecked, setAreWordsChecked] = useState<
    { _id: string; checked: boolean }[] | undefined
  >();

  const [successMessage, setSuccessMessage] = useState("");
  const lastHandledDeleteRef = useRef<FormStateWordJournal>(null);

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    { collectionId: string; checkedData: CheckedDataList }
  >(deleteWords, undefined);

  function handleToggleChecked(index: number) {
    // toggle checked only for clicked input, otherwise just return the same data
    setAreWordsChecked((prev) => {
      if (!prev) return;

      return prev.map((data, i) =>
        index === i ? { _id: data._id, checked: !data.checked } : data,
      );
    });
  }

  function handleToggleSelected() {
    setIsSelected((prev) => {
      // when user finished selecting, reset isAllCheched too
      if (prev) setIsAllChecked(false);

      return !prev;
    });
  }

  function handleChangeAllSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked;
    setIsAllChecked(isChecked);
  }

  function handleClickPagination(type: ActionPaginationType) {
    dispatch(type);
  }

  function handleClickDelete() {
    if (!areWordsChecked) return;

    // reset pagination
    dispatch("reset");

    startTransition(() =>
      action({ collectionId, checkedData: areWordsChecked }),
    );
  }

  // set initial areWordsChecked data from data
  useEffect(() => {
    if (!data?.length) return;

    const setInitialCheckedData = () =>
      setAreWordsChecked(
        data.map((data) => {
          return { _id: data._id || "", checked: false };
        }),
      );

    setInitialCheckedData();
  }, [data]);

  // when user finished selecting, reset isChecked for the checkbox
  // When user change the input of isAllSelected, change isChecked accordingly
  useEffect(() => {
    const changeAllCheckToFalse = () =>
      setAreWordsChecked((prev) => {
        if (!prev) return;

        return prev.map((data) => {
          return { _id: data._id, checked: false };
        });
      });

    const changeAllCheckToTrue = () =>
      setAreWordsChecked((prev) => {
        if (!prev) return;

        return prev.map((data) => {
          return { _id: data._id, checked: true };
        });
      });

    if (!isSelected || !isAllChecked) changeAllCheckToFalse();

    if (isAllChecked) changeAllCheckToTrue();
  }, [isSelected, isAllChecked]);

  // handle success
  useEffect(() => {
    // if it's executed already => return
    if (state === lastHandledDeleteRef.current || !state?.message) return;

    const displaySuccessMsg = async () => {
      const successMsg = state?.message;
      if (!successMsg) return;

      handleToggleSelected();
      handleUpdateUI();
      setSuccessMessage(successMsg[language]);
      await wait();
      setSuccessMessage("");
    };

    displaySuccessMsg();
    lastHandledDeleteRef.current = state;
  }, [state, language, handleUpdateUI]);

  return (
    <div className="w-[90%] sm:w-[85%] md:w-[70%] xl:w-[60%] 2xl:w-[50%] min-h-[80vh] max-h-fit flex flex-col items-center justify-center">
      {!data && <p>{language === "en" ? "Loading..." : "ロード中..."}</p>}
      {Array.isArray(data) && data?.length !== 0 && (
        <>
          {(isPending || state?.error?.message || successMessage) && (
            <div className="mt-2 h-fit">
              {isPending && (
                <PMessage
                  type="pending"
                  message={
                    language === "en" ? "Deleting word..." : "単語を削除中..."
                  }
                />
              )}
              {state?.error?.message && (
                <PMessage
                  type="error"
                  message={state.error.message[language]}
                />
              )}
              {successMessage && (
                <PMessage type="success" message={successMessage} />
              )}
            </div>
          )}
          <NumberOfLists
            language={language}
            passedWords={data.length}
            numberOfWords={numberOfWords}
          />
          <Selector
            language={language}
            isSelected={isSelected}
            onClickSelected={handleToggleSelected}
            onChangeSelectAll={handleChangeAllSelected}
            onClickDelete={handleClickDelete}
          />
          <WordLists
            data={data}
            isSelected={isSelected}
            areWordsChecked={areWordsChecked}
            onChangeInput={handleToggleChecked}
            handleUpdateUI={handleUpdateUI}
          />
          {!isSelected && (
            <ButtonPagination
              numberOfPages={getNumberOfPages(LISTS_ONE_PAGE, numberOfWords)}
              curPage={curPage}
              showNumber={true}
              onClickPagination={handleClickPagination}
            />
          )}
        </>
      )}
      {Array.isArray(data) && isArrayEmpty(data) && (
        <p className="w-full text-center text-lg text-amber-800/90">
          {language === "en" ? "No words found" : "単語が見つかりませんでした"}
        </p>
      )}
    </div>
  );
}

function NumberOfLists({
  language,
  passedWords,
  numberOfWords,
}: {
  language: Language;
  passedWords: number;
  numberOfWords: number;
}) {
  return (
    <p className=" text-right self-end mt-3 text-lg">
      {passedWords} / {numberOfWords} {language === "en" ? "words" : "単語"}
    </p>
  );
}

function Selector({
  language,
  isSelected,
  onClickSelected,
  onChangeSelectAll,
  onClickDelete,
}: {
  language: Language;
  isSelected: boolean;
  onClickSelected: () => void;
  onChangeSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickDelete: () => void;
}) {
  return (
    IsOnline() && (
      <div className="w-full flex flex-row justify-end gap-2 text-sm items-center mt-3">
        {isSelected && (
          <>
            <button
              type="button"
              className="bg-[url('/icons/trash.svg')] w-5 aspect-square bg-no-repeat bg-center bg-contain"
              onClick={onClickDelete}
            ></button>
            <label className="w-fit h-full flex flex-row items-center">
              {language === "en" ? "Select all" : "全てを選択"}:&nbsp;
              <input
                type="checkbox"
                className="w-4 aspect-square"
                onChange={onChangeSelectAll}
              ></input>
            </label>
          </>
        )}
        <button
          type="button"
          className="bg-orange-500 hover:bg-yellow-500 transition-all duration-300 text-white rounded py-[2px] px-1"
          onClick={onClickSelected}
        >
          {isSelected && (language === "en" ? "Finish" : "終了")}
          {!isSelected && (language === "en" ? "Select" : "選択")}
        </button>
      </div>
    )
  );
}

function WordLists({
  data,
  isSelected,
  areWordsChecked,
  onChangeInput,
  handleUpdateUI,
}: {
  data: WordData[];
  isSelected: boolean;
  areWordsChecked: { _id: string; checked: boolean }[] | undefined;
  onChangeInput: (index: number) => void;
  handleUpdateUI: () => void;
}) {
  return (
    <ul className="w-[17rem] sm:w-[19rem] md:w-[22rem] lg:w-[27rem] xl:w-[30rem] flex flex-col gap-5 sm:gap-7 lg:gap-8 py-5">
      {data.map((word, i) => (
        <div
          key={i}
          className="flex flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8"
        >
          {isSelected && areWordsChecked?.at(i) && (
            <input
              type="checkbox"
              checked={areWordsChecked[i].checked}
              className="w-5"
              onChange={() => onChangeInput(i)}
            ></input>
          )}
          <WordCard type="list" word={word} handleUpdateUI={handleUpdateUI} />
        </div>
      ))}
    </ul>
  );
}
