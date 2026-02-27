"use client";
// react
import { use, useActionState, useEffect, useReducer, useState } from "react";
// reducers
import { paginationReducer } from "@/app/lib/reducers";
// components
import ButtonPagination from "@/app/Components/ButtonPagination";
import WordCard from "@/app/Components/WordCard";
import PMessage from "@/app/Components/PMessage";
// methods
import { getNumberOfPages } from "@/app/lib/helper";
import { getMatchedWordsCurPage } from "@/app/lib/dal";
// settings
import {
  GENERAL_ERROR_MSG_DATA,
  LISTS_ONE_PAGE,
} from "@/app/lib/config/settings";
// type
import {
  TYPE_ACTION_PAGINATION,
  TYPE_DISPLAY_MESSAGE,
  TYPE_WORD,
} from "@/app/lib/config/type";
import { FormStateWord } from "@/app/lib/definitions";
import { deleteWords } from "@/app/actions/auth/words";

export default function List({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // states
  const [searchValue, setSearchValue] = useState("");
  const [words, setWords] = useState<TYPE_WORD[]>([]);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [curPage, dispatch] = useReducer(paginationReducer, 1);

  const [messageData, setMessageData] = useState<TYPE_DISPLAY_MESSAGE>();

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
        setMessageData(GENERAL_ERROR_MSG_DATA);
        return;
      }

      setNumberOfPages(
        getNumberOfPages(LISTS_ONE_PAGE, wordData.numberOfMatchedWords),
      );
      setWords(wordData.matchedWordsCurPage);
    };

    setWordsNumberOfPages();
  }, [id, searchValue, curPage]);

  return (
    <div
      className={`w-full h-fit flex flex-col items-center ${messageData ? "gap-3" : ""}`}
    >
      <SearchBar onSubmitSearch={handleSubmit} />
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      <Bottom
        data={words}
        numberOfPages={numberOfPages}
        curPage={curPage}
        dispatch={dispatch}
      />
    </div>
  );
}

function SearchBar({
  onSubmitSearch,
}: {
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="w-full h-20 bg-gradient-to-l from-orange-300 to-yellow-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-2"
      onSubmit={onSubmitSearch}
    >
      <input
        name="word"
        type="search"
        placeholder="search by word"
        className="w-[70%] h-[40%] rounded-full"
      ></input>
      <button
        type="submit"
        className="text-sm text-white bg-green-400/80 px-1 py-[2px] rounded shadow shadow-black/10"
      >
        Search
      </button>
    </form>
  );
}

function Bottom({
  data,
  numberOfPages,
  curPage,
  dispatch,
}: {
  data: TYPE_WORD[] | [];
  numberOfPages: number;
  curPage: number;
  dispatch: (action: TYPE_ACTION_PAGINATION) => void;
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);

  const [state, action, isPending] = useActionState<FormStateWord, FormData>(
    deleteWords,
    undefined,
  );

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

  function handleClickPagination(type: TYPE_ACTION_PAGINATION) {
    dispatch(type);
  }

  return (
    <div className="w-[90%] min-h-[80vh] max-h-fit flex flex-col items-center justify-center">
      {data.length !== 0 ? (
        <>
          <NumberOfLists
            passedWords={curPage * data.length}
            numberOfMatchedWords={numberOfPages * LISTS_ONE_PAGE}
          />
          <Selector
            isSelected={isSelected}
            onClickSelected={handleToggleSelected}
            onChangeSelectAll={handleChangeAllSelected}
            onClickDeleteAction={action}
          />
          <WordLists
            data={data}
            isSelected={isSelected}
            isAllChecked={isAllChecked}
          />
          <ButtonPagination
            numberOfPages={numberOfPages}
            curPage={curPage}
            showNumber={true}
            onClickPagination={handleClickPagination}
          />
        </>
      ) : (
        <p className="w-full text-center text-lg text-amber-800/90">
          No words found
        </p>
      )}
    </div>
  );
}

function NumberOfLists({
  passedWords,
  numberOfMatchedWords,
}: {
  passedWords: number;
  numberOfMatchedWords: number;
}) {
  return (
    <p className=" text-right self-end mt-3 text-lg">
      {passedWords} / {numberOfMatchedWords} words
    </p>
  );
}

function Selector({
  isSelected,
  onClickSelected,
  onChangeSelectAll,
  onClickDeleteAction,
}: {
  isSelected: boolean;
  onClickSelected: () => void;
  onChangeSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickDeleteAction: (formData: FormData) => void;
}) {
  return (
    <div className="w-full flex flex-row justify-end gap-2 text-sm items-center mt-3">
      {isSelected && (
        <>
          <button
            type="submit"
            className="bg-[url('/icons/trash.svg')] w-5 aspect-square bg-no-repeat bg-center bg-contain"
            formAction={onClickDeleteAction}
          ></button>
          <label className="w-fit h-full flex flex-row items-center">
            Select all:&nbsp;
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
        {isSelected ? "Finish" : "Select"}
      </button>
    </div>
  );
}

// reflect updates next.
// delete words next. Current problem is that there is form element inside another form element.
function WordLists({
  data,
  isSelected,
  isAllChecked,
}: {
  data: TYPE_WORD[] | [];
  isSelected: boolean;
  isAllChecked: boolean;
}) {
  return (
    <ul className="w-[90%] flex flex-col gap-5 py-5">
      {data.map((word, i) => (
        <WordCard
          key={i}
          type="list"
          word={word}
          isSelected={isSelected}
          isAllChecked={isAllChecked}
        />
      ))}
    </ul>
  );
}
