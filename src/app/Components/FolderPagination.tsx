"use client";
// react
import { useActionState, useEffect, useReducer, useState } from "react";
// components
import CreateFolder from "./CreateFolder";
import ButtonPagination from "./ButtonPagination";
// reducer
import { checkboxReducer, paginationReducer } from "../lib/reducers";
// type
import {
  TYPE_ACTION_PAGINATION,
  TYPE_COLLECTION,
  TYPE_COLLECTIONS,
  TYPE_DISPLAY_MESSAGE,
  TYPE_MESSAGE,
} from "../lib/config/type";
import { getNumberOfPages, wait } from "../lib/helper";
import Link from "next/link";
import { getCollectionDataCurPage } from "../lib/dal";
import {
  deleteCollection,
  updateCollection,
} from "../actions/auth/collections";
import { FormStateCollection } from "../lib/definitions";
import { nanoid } from "nanoid";

export default function FolderPagination({
  type,
  displayMessage,
}: {
  type: "main" | "addTo";
  displayMessage: (msgData: TYPE_DISPLAY_MESSAGE) => void;
}) {
  // design
  const sm = 640;
  const md = 768;
  const lg = 1024;
  const numberOfRows = 5;

  // states for design
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [numberOfCollectionsPage, setNumberOfCollectionPage] = useState(10);

  // states
  const [collectionData, setCollectionData] = useState<{
    collections: TYPE_COLLECTIONS[];
    numberOfCollections: number;
  }>({ collections: [], numberOfCollections: 0 });
  const [curPage, dispatch] = useReducer(paginationReducer, 1);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);

  async function handleSetIsUpdated() {
    setIsUpdated(true);
    await wait(0.3);
    // reset to other updates later
    setIsUpdated(false);
  }

  function handleClickPagination(type: TYPE_ACTION_PAGINATION) {
    dispatch(type);
  }

  function handleToggleCreateFolder() {
    setIsCreateCollectionOpen(!isCreateCollectionOpen);
  }

  useEffect(() => {
    const fetchCollectionData = async () => {
      const indexFrom = (curPage - 1) * numberOfCollectionsPage;
      const indexTo = curPage * numberOfCollectionsPage;

      const collections = await getCollectionDataCurPage(indexFrom, indexTo);

      if (collections) setCollectionData(collections);
    };
    fetchCollectionData();
  }, [curPage, numberOfCollectionsPage, isUpdated]);

  // Set numberOfColumns when it's rendered
  useEffect(() => {
    // design
    const getNumberOfColumns = (width: number) => {
      if (width < sm) return 2;
      if (width < md) return 3;
      if (width < lg) return 4;
      return 5;
    };

    const handleResize = async () => {
      const clientWidth = document.documentElement.clientWidth;

      const numColumns = getNumberOfColumns(clientWidth);
      const numCollectionsPage = numberOfRows * numColumns;

      setNumberOfColumns(numColumns);
      setNumberOfCollectionPage(numCollectionsPage);
      setNumberOfPages(
        getNumberOfPages(
          numCollectionsPage,
          collectionData.numberOfCollections,
        ),
      );
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [collectionData]);

  return (
    <div className="relative flex-[5] w-full h-full flex flex-col items-center overflow-hidden">
      <FolderContainer
        type={type}
        numberOfColumns={numberOfColumns}
        collections={collectionData.collections}
        isUpdated={isUpdated}
        handleUpdate={handleSetIsUpdated}
        onClickCreate={handleToggleCreateFolder}
        displayMessage={displayMessage}
      />
      <ButtonPagination
        numberOfPages={numberOfPages}
        curPage={curPage}
        showNumber={true}
        onClickPagination={handleClickPagination}
      />
      <CreateFolder
        widthClassName="w-full"
        heightClassName="h-1/2"
        isVisible={isCreateCollectionOpen}
        onClickClose={handleToggleCreateFolder}
        handleSetIsUpdated={handleSetIsUpdated}
      />
    </div>
  );
}

function FolderContainer({
  type,
  numberOfColumns,
  collections,
  isUpdated,
  handleUpdate,
  onClickCreate,
  displayMessage,
}: {
  type: "main" | "addTo";
  numberOfColumns: number;
  collections: TYPE_COLLECTION[];
  isUpdated: boolean;
  handleUpdate: () => void;
  onClickCreate: () => void;
  displayMessage: (msgData: TYPE_DISPLAY_MESSAGE) => void;
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDeleted, setIsDelete] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  function handleToggleSelected() {
    setIsSelected((prev) =>
      // Reset allSelected and isDeleted data
      {
        if (prev) {
          setIsAllSelected(false);
          setIsDelete(false);
          setIsEdited(false);
        }

        return !prev;
      },
    );
  }

  function handleChangeSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked;
    setIsAllSelected(isChecked);
  }

  function handleToggleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    // If user hasn't clicked the delete button but has clicked the edit button => do nothing, otherwise toggle
    setIsDelete((prev) => (!prev && isEdited ? prev : !prev));
  }

  function handleToggleEdit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    // If user hasn't clicked the edit button but has clicked the delete button => do nothing, otherwise toggle
    setIsEdited((prev) => (!prev && isDeleted ? prev : !prev));
  }

  useEffect(() => {
    if (isUpdated) (() => handleToggleSelected())();
  }, [isUpdated]);

  return (
    <form className="w-full flex-[4.5] p-[5%] flex flex-col items-center">
      {type === "main" && (
        <Selector
          isSelected={isSelected}
          isEdited={isEdited}
          isDeleted={isDeleted}
          onClickSelect={handleToggleSelected}
          handleUpdate={handleUpdate}
          onClickButton={onClickCreate}
          onChangeSelectAll={handleChangeSelectAll}
          onClickDelete={handleToggleDelete}
          onClickEdit={handleToggleEdit}
          displayMessage={displayMessage}
        />
      )}
      <ul
        className="w-full h-full grid grid-rows-5 items-center justify-items-center mt-1"
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
        }}
      >
        {collections &&
          collections.map((collection, i) => (
            <Folder
              key={nanoid()}
              i={i}
              type={type}
              data={collection}
              isSelected={isSelected}
              isAllSelected={isAllSelected}
              isDeleted={isDeleted}
              isEdited={isEdited}
              // displayMessage={displayMessage}
            />
          ))}
      </ul>
    </form>
  );
}

function Selector({
  isSelected,
  isEdited,
  isDeleted,
  onClickSelect,
  handleUpdate,
  onClickButton,
  onChangeSelectAll,
  onClickDelete,
  onClickEdit,
  displayMessage,
}: {
  isSelected: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  onClickSelect: () => void;
  handleUpdate: () => void;
  onClickButton: () => void;
  onChangeSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  displayMessage: (msgData: TYPE_DISPLAY_MESSAGE) => void;
}) {
  // action state for update
  const [updateState, updateAction, updateIsPending] = useActionState<
    FormStateCollection,
    FormData
  >(updateCollection, undefined);
  // use updateState as curUpdateState to modify
  const [curUpdateState, setCurUpdateState] = useState(updateState);

  // action state for delete
  const [deleteState, deleteAction, deleteIsPending] = useActionState<
    FormStateCollection,
    FormData
  >(deleteCollection, undefined);
  // use deleteState as curDeleteState to modify
  const [curDeleteState, setCurDeleteState] = useState(deleteState);

  const btnNewSelectClassName =
    "text-white rounded transition-all duration-300 px-1";
  const btnEditClassName =
    "bg-purple-500 text-white py-[1px] px-1 mr-1 rounded";

  // useEffect for update
  useEffect(() => {
    (() => setCurUpdateState(updateState))();
  }, [updateState]);

  useEffect(() => {
    if (!curUpdateState && !updateIsPending) {
      displayMessage(undefined);
      return;
    }

    if (updateIsPending) {
      displayMessage({
        type: "pending",
        message: "Updating collections...",
      });
      return;
    }

    if (curUpdateState?.error) {
      displayMessage({
        type: "error",
        message:
          curUpdateState?.error?.message || "Error occured. Plase try again.",
      });
      return;
    }

    if (curUpdateState?.message) {
      displayMessage({
        type: "success",
        message: curUpdateState?.message || "Collection updated",
      });

      handleUpdate();
      (() => setCurUpdateState(undefined))();
    }
  }, [curUpdateState, updateIsPending, displayMessage, handleUpdate]);

  // useEffect for delete
  useEffect(() => (() => setCurDeleteState(deleteState))(), [deleteState]);

  // when clicking trash button, delete keeps rendering, fix next
  useEffect(() => {
    if (!curDeleteState && !deleteIsPending) displayMessage(undefined);
  }, [curDeleteState, deleteIsPending, displayMessage]);

  useEffect(() => {
    if (!deleteIsPending) return;

    displayMessage({
      type: "pending",
      message: "Deleting collection...",
    });
  }, [deleteIsPending, displayMessage]);

  useEffect(() => {
    if (!curDeleteState?.error) return;

    displayMessage({
      type: "error",
      message:
        curDeleteState?.error?.message || "Error occured. Please try again.",
    });
  }, [curDeleteState?.error, displayMessage]);

  useEffect(() => {
    if (!curDeleteState?.message) return;

    displayMessage({
      type: "success",
      message: curDeleteState?.message || "Collection deleted",
    });

    handleUpdate();
    (() => setCurDeleteState(undefined))();
  }, [curDeleteState?.message, displayMessage, handleUpdate]);

  return (
    <div className="w-[92%] flex flex-row justify-end gap-2 text-sm items-center">
      {
        <>
          {!isSelected ? (
            <button
              type="button"
              className={`${btnNewSelectClassName} w-fit h-[90%] leading-none bg-green-400 flex flex-row items-center text-[13px] py-0 hover:bg-green-300`}
              onClick={onClickButton}
            >
              <span className="text-xl mr-1">+</span>
              New collection
            </button>
          ) : (
            <>
              {!isEdited ? (
                <button
                  type="button"
                  className={btnEditClassName}
                  onClick={onClickEdit}
                >
                  Edit name
                </button>
              ) : (
                <button
                  type="submit"
                  className={btnEditClassName}
                  formAction={updateAction}
                >
                  Finish editing
                </button>
              )}
              {!isDeleted ? (
                <button
                  type="button"
                  className="bg-orange-500 text-white py-[1px] px-1 mr-1 rounded"
                  onClick={onClickDelete}
                >
                  Delete
                </button>
              ) : (
                <button
                  type="submit"
                  className="bg-[url('/icons/trash.svg')] w-5 aspect-square bg-no-repeat bg-center bg-contain"
                  formAction={deleteAction}
                ></button>
              )}
              {(isEdited || isDeleted) && (
                <label className="w-fit h-full flex flex-row items-center">
                  Select all:&nbsp;
                  <input
                    type="checkbox"
                    className="w-4 aspect-square"
                    onChange={onChangeSelectAll}
                  ></input>
                </label>
              )}
            </>
          )}
          <button
            type="button"
            className={`${btnNewSelectClassName} bg-orange-500 hover:bg-yellow-500 py-[2px]`}
            onClick={onClickSelect}
          >
            {isSelected ? "Finish" : "Select"}
          </button>
        </>
      }
    </div>
  );
}

function Folder({
  i,
  data,
  type,
  isSelected,
  isAllSelected,
  isDeleted,
  isEdited,
  // displayMessage,
}: {
  i: number;
  data: TYPE_COLLECTION;
  type: "main" | "addTo";
  isSelected: boolean;
  isAllSelected: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  // displayMessage?: (msg: string) => void;
}) {
  const [isChecked, dispatch] = useReducer(checkboxReducer, false);
  const [name, setName] = useState(data.name);

  function handleToggleChecked() {
    dispatch("toggle");
  }

  function handleChangeName(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setName(value);
  }

  // add-to page
  function handleAddTo() {
    console.log(data._id);

    // if (displayMessage)
    //   displayMessage("The word added to the folder successfully");
  }

  // Reset isChecked when user finished selecting
  useEffect(() => {
    if (!isSelected) dispatch(false);
  }, [isSelected]);

  useEffect(() => {
    dispatch(isAllSelected);
  }, [isAllSelected]);

  return (
    <div className="w-[90%] h-[85%] flex flex-row gap-2">
      {/* Remove the first one (All) collection so it cannot be deleted or edited */}
      {i !== 0 && isSelected && (
        <input
          type="checkbox"
          // use name only for deleting collections
          name={isDeleted ? data._id : ""}
          checked={isChecked}
          className="w-4 aspect-square"
          onChange={handleToggleChecked}
        ></input>
      )}
      <Link
        href={`/folder/${data._id}`}
        className={`relative w-full h-full bg-gradient-to-l from-red-500 to-orange-400 hover:from-orange-500 hover:to-yellow-400 rounded flex flex-row items-center text-center shadow-sm shadow-black/30 px-2 gap-1 overflow-hidden`}
      >
        {type === "addTo" && (
          <button
            type="button"
            className="absolute w-full h-full top-0 left-0 bg-black/30 hover:bg-black/50 text-white text-xl font-bold"
            onClick={handleAddTo}
          >
            ✓
          </button>
        )}
        {/* Remove the first one (All) collection so it cannot be edited */}
        {i !== 0 && isEdited && isChecked ? (
          <input
            name={data._id}
            placeholder="new name"
            value={name}
            className="w-full z-10"
            onChange={handleChangeName}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
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
      </Link>
    </div>
  );
}
