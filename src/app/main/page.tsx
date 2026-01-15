"use client";
import { useEffect, useState } from "react";
import Logo from "../Components/Logo";

export default function Main() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Top />
      <FolderContainer />
      <Pagination />
    </div>
  );
}

function Top() {
  const btnClassName = "w-fit h-full bg-top bg-no-repeat text-xs";

  return (
    <div className="relative w-full flex flex-row items-center flex-1">
      <Logo />
      <div className="absolute w-1/3 h-[70%] flex flex-row items-center justify-center gap-4 right-3">
        <button
          type="button"
          className={`${btnClassName} bg-[url('/icons/dictionary.svg')] bg-[length:60%] pt-[30%]`}
        >
          Dictionary
        </button>
        <button
          type="button"
          className={`${btnClassName} bg-[url('/icons/plus.svg')] bg-[length:80%] pt-[20%] mt-[10%]`}
        >
          Add
        </button>
      </div>
    </div>
  );
}

function FolderContainer() {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);

  function handleToggleSelected() {
    setIsSelected((prev) => {
      if (!prev === false) setIsAllSelected(false);
      return !prev;
    });
  }

  function handleChangeSelectAll() {
    setIsAllSelected(!isAllSelected);
  }

  return (
    <div className="w-full flex-[4.5] p-[5%] flex flex-col items-center">
      <Selector
        isSelected={isSelected}
        onClickSelected={handleToggleSelected}
        onChangeSelectAll={handleChangeSelectAll}
      />
      <ul className="w-full h-full grid grid-cols-2 grid-rows-5 items-center justify-items-center mt-1">
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <Folder isSelected={isSelected} isAllSelected={isAllSelected} />
        <button
          type="button"
          className="h-10 aspect-square text-3xl text-white bg-red-400 rounded-[50%] pb-1 shadow-sm shadow-black/30"
        >
          +
        </button>
      </ul>
    </div>
  );
}

function Selector({
  isSelected,
  onClickSelected,
  onChangeSelectAll,
}: {
  isSelected: boolean;
  onClickSelected: () => void;
  onChangeSelectAll: () => void;
}) {
  return (
    <div className="w-[92%] flex flex-row justify-end gap-2 text-sm items-center">
      {isSelected && (
        <>
          <button
            type="button"
            className="bg-[url('/icons/trash.svg')] w-5 aspect-square bg-no-repeat bg-center bg-contain"
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
        className="bg-orange-500 text-white rounded py-[2px] px-1"
        onClick={onClickSelected}
      >
        {isSelected ? "Finish" : "Select"}
      </button>
    </div>
  );
}

function Folder({
  isSelected,
  isAllSelected,
}: {
  isSelected: boolean;
  isAllSelected: boolean;
}) {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    setIsChecked(isAllSelected);
  }, [isAllSelected]);

  function handleToggleChecked() {
    setIsChecked(!isChecked);
  }

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
        <span
          className={`text-white whitespace-nowrap overflow-hidden  text-ellipsis ${
            isSelected ? "w-full" : "w-[75%]"
          }`}
        >
          Collection 1
        </span>
        {!isSelected && (
          <span className="w-[25%] text-white/80 whitespace-nowrap overflow-hidden  text-ellipsis text-xs">
            303
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
