"use client";
import ButtonPagination from "@/app/Components/ButtonPagination";
import { checkboxReducer, paginationReducer } from "@/app/lib/reducers";
import { TYPE_ACTION_PAGINATION, TYPE_WORD } from "@/app/lib/config/type";
import Image from "next/image";
import { use, useEffect, useReducer, useRef, useState } from "react";
import { getSubmittedWordData } from "@/app/lib/helper";
import ImageWord from "@/app/Components/ImageWord";
import AudioWord from "@/app/Components/AudioWord";

export default function List({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  //   For dev
  const wordData: TYPE_WORD[] | [] = [
    {
      name: "Hey",
      audio: { name: "bb", data: "" },
      definitions: ["jsksk aka"],
      examples: ["ajka", "jaka"],
      imageName: { name: "aa", data: "" },
      imageDefinitions: { name: "bb", data: "" },
    },
    {
      name: "Hey",
      audio: { name: "bb", data: "" },
      definitions: ["jsksk aka"],
      examples: ["ajka", "jaka"],
      imageName: { name: "aa", data: "" },
      imageDefinitions: { name: "aa", data: "" },
    },
    {
      name: "Hey",
      audio: { name: "bb", data: "" },
      definitions: ["s aka"],
      examples: ["jaka"],
      imageName: { name: "", data: "" },
      imageDefinitions: { name: "", data: "" },
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
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [curPage, dispatch] = useReducer(paginationReducer, 1);

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
      <WordLists
        data={data}
        isSelected={isSelected}
        isAllChecked={isAllChecked}
      />
      <ButtonPagination
        numberOfPages={numberOfPages}
        curPage={curPage}
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
        <WordList
          key={i}
          word={word}
          isSelected={isSelected}
          isAllChecked={isAllChecked}
        />
      ))}
    </ul>
  );
}

function WordList({
  word,
  isSelected,
  isAllChecked,
}: {
  word: TYPE_WORD;
  isSelected: boolean;
  isAllChecked: boolean;
}) {
  const maxPage = 3;
  const formRef = useRef<HTMLFormElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChecked, dispatch] = useReducer(checkboxReducer, false);
  const [isEdited, setIsEdited] = useState(false);
  const [wordData, setWordData] = useState<TYPE_WORD>(word);

  const getContent = () => {
    const textareaClassName = "w-[65%]";
    const h3ClassName = "text-black/80 text-lg";

    function handleClickRemove(type: string) {
      setWordData((prev) => ({
        ...prev,
        [type]: undefined,
      }));
    }

    if (isEdited)
      return (
        <form className="flex flex-col gap-2 p-3" onSubmit={handleSubmit}>
          <label>
            Word: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input
              name="name"
              placeholder="word name"
              value={wordData.name}
              className="w-[55%]"
              onChange={handleChangeInput}
            ></input>
          </label>
          <AudioWord />
          <label>
            Definition:{" "}
            <textarea
              name="definitions"
              placeholder="definitions"
              value={wordData.definitions.join("\n")}
              className={`${textareaClassName} resize-none`}
              onChange={handleChangeTextarea}
            ></textarea>
          </label>
          <label>
            Examples:{" "}
            <textarea
              name="examples"
              placeholder="example sentences"
              value={wordData.examples.join("\n")}
              className={`${textareaClassName} resize-none`}
              onChange={handleChangeTextarea}
            ></textarea>
          </label>
          <ImageWord
            type="word name"
            imageName={wordData.imageName?.name || ""}
            onClickRemove={handleClickRemove}
          />
          <ImageWord
            type="definitions"
            imageName={wordData.imageDefinitions?.name || ""}
            onClickRemove={handleClickRemove}
          />
          <button
            type="submit"
            className="w-fit bg-green-500 self-center text-white px-1 rounded hover:bg-green-300"
          >
            OK
          </button>
        </form>
      );

    if (currentPage === 1)
      return (
        <>
          <p className="text-3xl">{word.name}</p>
          {word.imageName?.data && (
            <Image
              src={word.imageName.data}
              alt={word.imageName.name || "Word name image"}
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
          {word.imageDefinitions?.data && (
            <Image
              src={word.imageDefinitions.data}
              alt={word.imageDefinitions.name || "Definition image"}
            ></Image>
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

  function handleToggleEdit() {
    setIsEdited(!isEdited);
  }

  function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    const value = target.value;
    setWordData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  }

  function handleChangeTextarea(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const target = e.currentTarget;
    const value = target.value.split("\n");
    setWordData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  }

  function handleClickList(e: React.MouseEvent<HTMLDivElement>) {
    if (e.currentTarget === e.target)
      setCurrentPage((prev) => (prev === maxPage ? 1 : prev + 1));
  }

  function handleToggleChecked() {
    dispatch("toggle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();
      const data = await getSubmittedWordData(e.currentTarget);
      const imageName = data?.imageName;
      const imageDefinitions = data?.imageDefinitions;

      // replace images
      const newData = { ...data };
      newData.imageName = imageName || data?.imageName;
      newData.imageDefinitions = imageDefinitions || data?.imageDefinitions;

      console.log(newData);
    } catch (err: unknown) {
      console.error("Error", err);
    }
  }

  // when user finished selecting, reset isChecked for the checkbox
  useEffect(() => {
    if (!isSelected) dispatch(false);
  }, [isSelected]);

  // When user change the input of isAllSelected, change isChecked accordingly
  useEffect(() => {
    dispatch(isAllChecked);
  }, [isAllChecked]);

  return (
    <div className="flex flex-row gap-3">
      {isSelected && (
        <input
          type="checkbox"
          checked={isChecked}
          className="w-5"
          onChange={handleToggleChecked}
        ></input>
      )}
      <div
        className="relative w-full min-h-44 bg-yellow-100 shadow-md shadow-black/20 rounded flex flex-col items-center justify-center cursor-pointer"
        onClick={handleClickList}
      >
        <button
          type="button"
          className="absolute w-4 aspect-square bg-[url('/icons/edit.svg')] bg-center bg-contain bg-no-repeat right-3 top-2 transition-all duration-150 hover:translate-y-[-2px]"
          onClick={handleToggleEdit}
        ></button>
        {getContent()}
      </div>
    </div>
  );
}
