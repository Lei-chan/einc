"use client";
import { useEffect, useState } from "react";
import CreateFolder from "./CreateFolder";
import ButtonPlus from "./ButtonPlus";

// For dev
const userCollections = [
  { id: "kak", name: "Collection 1", numberOfWords: 333 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "f", name: "Collection 3", numberOfWords: 53 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
  { id: "kb", name: "Collection 2", numberOfWords: 2 },
  { id: "kb", name: "Collection 2", numberOfWords: 533 },
];

export default function FolderPagination({
  type,
  displayError,
  displayMessage,
}: {
  type: "main" | "addTo";
  displayError?: (msg: string) => void;
  displayMessage?: (msg: string) => void;
}) {
  const sm = 640;
  const md = 768;
  const lg = 1024;
  const numberOfRows = 5;
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [numberOfCollectionsPage, setNumberOfCollectionPage] = useState(10);
  const [curPage, setCurPage] = useState(1);
  const [isFolderCreated, setIsFolderCreated] = useState(false);

  const getCurCollections = () =>
    userCollections.slice(
      (curPage - 1) * numberOfCollectionsPage,
      curPage * numberOfCollectionsPage,
    );

  const handleGoToPrevPage = () => setCurPage((prev) => prev - 1);

  const handleGoToNextPage = () => setCurPage((prev) => prev + 1);

  function handleToggleCreateFolder() {
    setIsFolderCreated(!isFolderCreated);
  }

  // Set numberOfColumns when it's rendered
  useEffect(() => {
    const getNumberOfColumns = (width: number) => {
      if (width < sm) return 2;
      if (width < md) return 3;
      if (width < lg) return 4;
      return 5;
    };

    const getNumberOfPages = (
      numCollectionsPage: number,
      numUserCollections: number,
    ) => Math.ceil(numUserCollections / numCollectionsPage);

    const handleResize = () => {
      const clientWidth = document.documentElement.clientWidth;

      const numColumns = getNumberOfColumns(clientWidth);
      const numCollectionsPage = numberOfRows * numColumns;

      setNumberOfColumns(numColumns);
      setNumberOfCollectionPage(numCollectionsPage);
      setNumberOfPages(
        getNumberOfPages(numCollectionsPage, userCollections.length),
      );
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative flex-[5] w-full h-full flex flex-col items-center overflow-hidden">
      <FolderContainer
        type={type}
        numberOfColumns={numberOfColumns}
        numberOfCollectionsPage={numberOfCollectionsPage}
        collections={getCurCollections()}
        onClickCreate={handleToggleCreateFolder}
        displayError={displayError}
        displayMessage={displayMessage}
      />
      <Pagination
        numberOfPages={numberOfPages}
        curPage={curPage}
        onClickPrev={handleGoToPrevPage}
        onClickNext={handleGoToNextPage}
      />
      <CreateFolder
        widthClassName="w-full"
        heightClassName="h-[40%]"
        isVisible={isFolderCreated}
        onClickClose={handleToggleCreateFolder}
      />
    </div>
  );
}

function FolderContainer({
  type,
  numberOfColumns,
  numberOfCollectionsPage,
  collections,
  onClickCreate,
  displayError,
  displayMessage,
}: {
  type: "main" | "addTo";
  numberOfColumns: number;
  numberOfCollectionsPage: number;
  collections: { id: string; name: string; numberOfWords: number }[];
  onClickCreate: () => void;
  displayError?: (msg: string) => void;
  displayMessage?: (msg: string) => void;
}) {
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

  return (
    <div className="w-full flex-[4.5] p-[5%] flex flex-col items-center">
      {type === "main" && (
        <Selector
          isSelected={isSelected}
          isEdited={isEdited}
          onClickSelected={handleToggleSelected}
          onChangeSelectAll={handleChangeSelectAll}
          onClickDelete={handleToggleDelete}
          onClickEdit={handleToggleEdit}
        />
      )}
      <ul
        className="w-full h-full grid grid-rows-5 items-center justify-items-center mt-1"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
        }}
      >
        {collections.map((collection, i) => (
          <Folder
            key={i}
            type={type}
            data={collection}
            isSelected={isSelected}
            isAllSelected={isAllSelected}
            isDeleted={isDeleted}
            isEdited={isEdited}
            displayError={displayError}
            displayMessage={displayMessage}
          />
        ))}
        {collections.length < numberOfCollectionsPage && (
          <ButtonPlus onClickButton={onClickCreate} />
        )}
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
  type,
  isSelected,
  isAllSelected,
  isDeleted,
  isEdited,
  displayError,
  displayMessage,
}: {
  data: { id: string; name: string; numberOfWords: number };
  type: "main" | "addTo";
  isSelected: boolean;
  isAllSelected: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  displayError?: (msg: string) => void;
  displayMessage?: (msg: string) => void;
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

  // add-to page
  function handleAddTo() {
    console.log(data.id);

    if (displayMessage)
      displayMessage("The word added to the folder successfully");
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
      <li className="relative w-full h-full bg-gradient-to-l from-red-500 to-orange-400 rounded flex flex-row items-center text-center shadow-sm shadow-black/30 px-2 gap-1 overflow-hidden">
        {type === "addTo" && (
          <button
            type="button"
            className="absolute w-full h-full top-0 left-0 bg-black/30 hover:bg-black/50 text-white text-xl font-bold"
            onClick={handleAddTo}
          >
            ✓
          </button>
        )}
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

function Pagination({
  numberOfPages,
  curPage,
  onClickPrev,
  onClickNext,
}: {
  numberOfPages: number;
  curPage: number;
  onClickPrev: () => void;
  onClickNext: () => void;
}) {
  const btnClassName =
    "w-9 absolute bg-gradient-to-l from-orange-700 to-orange-700/80 p-1 rounded-[50%] text-sm";
  return (
    <div className="flex-[0.5] text-white">
      {curPage > 1 && (
        <button
          type="button"
          className={`${btnClassName} left-7`}
          onClick={onClickPrev}
        >
          ←{curPage - 1}
        </button>
      )}
      {numberOfPages > curPage && (
        <button
          type="button"
          className={`${btnClassName} right-7`}
          onClick={onClickNext}
        >
          {curPage + 1}→
        </button>
      )}
    </div>
  );
}
