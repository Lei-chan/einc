"use client";
import ButtonPagination from "@/app/Components/ButtonPagination";
import { paginationReducer } from "@/app/lib/config/reducers";
import { TYPE_ACTION_PAGINATION, TYPE_WORD } from "@/app/lib/config/type";
import Image from "next/image";
import { use, useReducer, useState } from "react";

export default function List({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  //   For dev
  const wordData: TYPE_WORD[] | [] = [
    {
      name: "Hey",
      pronunciationAudio: "",
      definitions: ["jsksk aka"],
      examples: ["ajka", "jaka"],
      imageName: "",
      imageDefinitions: "",
    },
    {
      name: "Hey",
      pronunciationAudio: "",
      definitions: ["jsksk aka"],
      examples: ["ajka", "jaka"],
      imageName: "",
      imageDefinitions: "",
    },
    {
      name: "Hey",
      pronunciationAudio: "",
      definitions: ["s aka"],
      examples: ["jaka"],
      imageName: "",
      imageDefinitions: "",
    },
  ];

  return (
    <div className="w-full h-fit flex flex-col items-center">
      <SearchBar />
      <Bottom data={wordData} />
    </div>
  );
}

function SearchBar() {
  const [word, setWord] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = String(formData.get("word")).trim();
    if (value) setWord(value);
  }

  return (
    <form
      className="w-full h-20 bg-gradient-to-l from-orange-300 to-yellow-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-2"
      onSubmit={handleSubmit}
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

function Bottom({ data }: { data: TYPE_WORD[] | [] }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [numberOfPages, setNumberOfPages] = useState(3);
  const [state, dispatch] = useReducer(paginationReducer, 1);

  function handleToggleSelected() {
    setIsSelected(!isSelected);
  }

  function handleChangeAllSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked;
    setIsAllSelected(isChecked);
  }

  function handleClickDelete() {
    console.log("deleted");
  }

  function handleClickPagination(type: TYPE_ACTION_PAGINATION) {
    dispatch(type);
  }

  return (
    <div className="w-[90%] h-fit flex flex-col items-center">
      <NumberOfLists />
      <Selector
        isSelected={isSelected}
        onClickSelected={handleToggleSelected}
        onChangeSelectAll={handleChangeAllSelected}
        onClickDelete={handleClickDelete}
      />
      <WordLists data={data} />
      <ButtonPagination
        numberOfPages={numberOfPages}
        curPage={state}
        onClickPagination={handleClickPagination}
      />
    </div>
  );
}

function NumberOfLists() {
  return <p className=" text-right self-end mt-3 text-lg">50 / 115 words</p>;
}

function Selector({
  isSelected,
  onClickSelected,
  onChangeSelectAll,
  onClickDelete,
}: {
  isSelected: boolean;
  onClickSelected: () => void;
  onChangeSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickDelete: () => void;
}) {
  return (
    <div className="w-full flex flex-row justify-end gap-2 text-sm items-center mt-3">
      {isSelected && (
        <>
          <button
            type="button"
            className="bg-[url('/icons/trash.svg')] w-5 aspect-square bg-no-repeat bg-center bg-contain"
            onClick={onClickDelete}
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

function WordLists({ data }: { data: TYPE_WORD[] | [] }) {
  return (
    <ul className="w-[90%] flex flex-col gap-5 py-5">
      {data.map((word, i) => (
        <WordList key={i} word={word} />
      ))}
    </ul>
  );
}

function WordList({ word }: { word: TYPE_WORD }) {
  const maxPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const getContent = () => {
    const h3ClassName = "text-black/80 text-lg";

    if (currentPage === 1)
      return (
        <>
          <p className="text-3xl">{word.name}</p>
          {word.imageName && (
            <Image
              src={word.imageName}
              alt="Word name image"
              width={500}
              height={400}
            ></Image>
          )}
        </>
      );

    if (currentPage === 2)
      return (
        <>
          <h3 className={h3ClassName}>Definitions</h3>
          <p>
            {word.definitions.map((def, i) => (
              <span key={i}>
                • {def}
                {def !== word.definitions.at(-1) && <br />}
              </span>
            ))}
          </p>
          {word.imageDefinitions && (
            <Image src={word.imageDefinitions} alt="Definition image"></Image>
          )}
        </>
      );

    return (
      <>
        <h3 className={h3ClassName}>Examples</h3>
        <p>
          {word.examples.map((exam, i) => (
            <span key={i}>
              • {exam}
              {exam !== word.examples.at(-1) && <br />}
            </span>
          ))}
        </p>
      </>
    );
  };

  function handleClickWord() {
    setCurrentPage((prev) => (prev === maxPage ? 1 : prev + 1));
  }

  return (
    <form
      className="w-full min-h-44 bg-yellow-100 shadow-md shadow-black/20 rounded flex flex-col items-center justify-center cursor-pointer"
      onClick={handleClickWord}
    >
      {getContent()}
    </form>
  );
}
