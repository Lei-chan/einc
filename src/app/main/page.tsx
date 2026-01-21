"use client";
import { useEffect, useState } from "react";
import Logo from "../Components/Logo";
import Link from "next/link";
import ButtonPlus from "../Components/ButtonPlus";

// work on pagination next!!
export default function Main() {
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const numberOfRows = 5;
  const sm = 640;
  const md = 768;
  const lg = 1024;

  const getNumberOfColumns = (width: number) => {
    if (width < sm) return 2;
    if (width < md) return 3;
    if (width < lg) return 4;
    return 5;
  };

  // Set numberOfColumns when it's rendered
  useEffect(() => {
    const handleResize = () => {
      const clientWidth = document.documentElement.clientWidth;
      setNumberOfColumns(getNumberOfColumns(clientWidth));
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col">
      <Top />
      <FolderContainer numberOfColumns={numberOfColumns} />
      <Pagination />
    </div>
  );
}

function Top() {
  const btnClassName = "h-full bg-top bg-no-repeat text-xs";

  return (
    <div className="relative w-full flex flex-row items-center flex-1">
      <Logo />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-center gap-[6%] right-2 text-center">
        <Link
          href="/main/dictionary"
          className={`${btnClassName} w-[30%] bg-[url('/icons/dictionary.svg')] bg-[length:60%] pt-[20%]`}
        >
          Dictionary
        </Link>
        <Link
          href="/main/add"
          className={`${btnClassName} w-[20%] bg-[url('/icons/plus.svg')] bg-[length:65%] mt-[4%] pt-[18%]`}
        >
          Add
        </Link>
        <Link
          href="/account"
          className={`${btnClassName} w-[28%] aspect-square bg-[url('/icons/account.svg')] bg-[length:63%] mt-[1%] pt-[20%]`}
        >
          Account
        </Link>
      </div>
    </div>
  );
}

function FolderContainer({ numberOfColumns }: { numberOfColumns: number }) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDeleted, setIsDelete] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  // Reset allSelected and isDeleted data
  function handleToggleSelected() {
    setIsSelected((prev) => {
      if (!prev === false) {
        setIsAllSelected(false);
        setIsDelete(false);
        setIsEdited(false);
      }
      return !prev;
    });
  }

  function handleChangeSelectAll() {
    setIsAllSelected(!isAllSelected);
  }

  function handleToggleDelete() {
    setIsDelete(!isDeleted);
  }

  function handleToggleEdit() {
    setIsEdited(!isEdited);
  }

  function handleClickAdd() {}

  return (
    <div className="w-full flex-[4.5] p-[5%] flex flex-col items-center">
      <Selector
        isSelected={isSelected}
        isEdited={isEdited}
        onClickSelected={handleToggleSelected}
        onChangeSelectAll={handleChangeSelectAll}
        onClickDelete={handleToggleDelete}
        onClickEdit={handleToggleEdit}
      />
      <ul
        className="w-full h-full grid grid-rows-5 items-center justify-items-center mt-1"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
        }}
      >
        <Folder
          data={{ id: "kak", name: "Collection 1", numberOfWords: 333 }}
          isSelected={isSelected}
          isAllSelected={isAllSelected}
          isDeleted={isDeleted}
          isEdited={isEdited}
        />
        <Folder
          data={{ id: "bgd", name: "Collection 2", numberOfWords: 533 }}
          isSelected={isSelected}
          isAllSelected={isAllSelected}
          isDeleted={isDeleted}
          isEdited={isEdited}
        />
        <ButtonPlus onClickButton={handleClickAdd} />
      </ul>
    </div>
  );
}

function Selector({
  isSelected,
  isEdited,
  onClickSelected,
  onChangeSelectAll,
  onClickDelete,
  onClickEdit,
}: {
  isSelected: boolean;
  isEdited: boolean;
  onClickSelected: () => void;
  onChangeSelectAll: () => void;
  onClickDelete: () => void;
  onClickEdit: () => void;
}) {
  return (
    <div className="w-[92%] flex flex-row justify-end gap-2 text-sm items-center">
      {isSelected && (
        <>
          <button
            type="button"
            className="bg-purple-500 text-white py-[1px] px-1 mr-1 rounded"
            onClick={onClickEdit}
          >
            {isEdited ? "Finish editing" : "Edit name"}
          </button>
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

function Folder({
  data,
  isSelected,
  isAllSelected,
  isDeleted,
  isEdited,
}: {
  data: { id: string; name: string; numberOfWords: number };
  isSelected: boolean;
  isAllSelected: boolean;
  isDeleted: boolean;
  isEdited: boolean;
}) {
  const [isChecked, setIsChecked] = useState(false);
  const [name, setName] = useState(data.name);

  function handleToggleChecked() {
    setIsChecked(!isChecked);
  }

  function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value.trim();
    setName(value);
  }

  // Reset isChecked when user finished selecting
  useEffect(() => {
    if (!isSelected) setIsChecked(false);
  }, [isSelected]);

  useEffect(() => {
    setIsChecked(isAllSelected);
  }, [isAllSelected]);

  // If user clicks delete button and this folder is checked, delete
  useEffect(() => {
    if (isDeleted && isChecked) console.log(data.id);
  }, [isDeleted, isChecked, data.id]);

  return (
    <div className="w-[90%] h-[85%] flex flex-row gap-2">
      {isSelected && (
        <input
          type="checkbox"
          checked={isChecked}
          className="w-4 aspect-square"
          onChange={handleToggleChecked}
        ></input>
      )}
      <li className="relative w-full h-full bg-gradient-to-l from-red-500 to-orange-400 rounded flex flex-row items-center text-center shadow-sm shadow-black/30 px-2 gap-1">
        {isEdited && isChecked ? (
          <input
            placeholder="new name"
            value={name}
            className="w-full"
            onChange={handleChangeName}
          ></input>
        ) : (
          <span
            className={`text-white whitespace-nowrap overflow-hidden  text-ellipsis ${
              isSelected ? "w-full" : "w-[75%]"
            }`}
          >
            {data.name}
          </span>
        )}
        {!isSelected && (
          <span className="w-[25%] text-white/80 whitespace-nowrap overflow-hidden  text-ellipsis text-xs">
            {data.numberOfWords}
          </span>
        )}
      </li>
    </div>
  );
}

function Pagination() {
  const btnClassName =
    "w-9 absolute bg-gradient-to-l from-orange-700 to-orange-700/80 p-1 rounded-[50%] text-sm";
  return (
    <div className="flex-[0.5] text-white">
      <button type="button" className={`${btnClassName} left-7`}>
        ←1
      </button>
      <button type="button" className={`${btnClassName} right-7`}>
        3→
      </button>
    </div>
  );
}
