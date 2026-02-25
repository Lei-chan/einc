"use client";
// react
import { useActionState, useEffect, useReducer, useRef, useState } from "react";
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
import PMessage from "./PMessage";

export default function FolderPagination({ type }: { type: "main" | "addTo" }) {
  // design
  const sm = 640;
  const md = 768;
  const lg = 1024;
  const numberOfRows = 5;

  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [collectionData, setCollectionData] = useState<{
    collections: TYPE_COLLECTIONS[];
    numberOfCollections: number;
  }>({ collections: [], numberOfCollections: 0 });

  const numberOfCollectionsPage = numberOfRows * numberOfColumns;
  const numberOfPages = getNumberOfPages(
    numberOfCollectionsPage,
    collectionData.numberOfCollections,
  );

  // others
  const [curPage, dispatch] = useReducer(paginationReducer, 1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [messageData, setMessageData] =
    useState<TYPE_DISPLAY_MESSAGE>(undefined);

  // display message for 3 seconds
  async function displayMessage(msgData: TYPE_DISPLAY_MESSAGE) {
    setMessageData(msgData);
    await wait();
    setMessageData(undefined);
  }

  function handleSetIsUpdated() {
    setRefreshKey((prev) => prev + 1);
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
  }, [refreshKey, curPage, numberOfCollectionsPage]);

  // Set numberOfColumns when it's rendered
  useEffect(() => {
    const getNumberOfColumns = (width: number) => {
      if (width < sm) return 2;
      if (width < md) return 3;
      if (width < lg) return 4;
      return 5;
    };

    const handleResize = async () => {
      const clientWidth = document.documentElement.clientWidth;

      const numColumns = getNumberOfColumns(clientWidth);

      setNumberOfColumns(numColumns);
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [collectionData]);

  return (
    <div className="relative flex-[5] w-full h-full flex flex-col items-center overflow-hidden">
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      <FolderContainer
        type={type}
        numberOfColumns={numberOfColumns}
        collections={collectionData.collections}
        refreshKey={refreshKey}
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
  refreshKey,
  handleUpdate,
  onClickCreate,
  displayMessage,
}: {
  type: "main" | "addTo";
  numberOfColumns: number;
  collections: TYPE_COLLECTION[];
  refreshKey: number;
  handleUpdate: () => void;
  onClickCreate: () => void;
  displayMessage: (msgData: TYPE_DISPLAY_MESSAGE) => void;
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDeleted, setIsDelete] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

  function handleToggleSelected() {
    setIsSelected(!isSelected);
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
    const setSelectedToFalse = () => setIsSelected(false);

    setSelectedToFalse();
  }, [refreshKey]);

  useEffect(() => {
    if (isSelected) return;

    const setAllButtonsToFalse = () => {
      // Reset allSelected and isDeleted data
      setIsAllSelected(false);
      setIsDelete(false);
      setIsEdited(false);
    };
    setAllButtonsToFalse();
  }, [isSelected]);

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
              type={type}
              data={collection}
              isSelected={isSelected}
              isAllSelected={isAllSelected}
              isDeleted={isDeleted}
              isEdited={isEdited}
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
  const btnNewSelectClassName =
    "text-white rounded transition-all duration-300 px-1";
  const btnEditClassName =
    "bg-purple-500 text-white py-[1px] px-1 mr-1 rounded";

  // action state for update
  const [updateState, updateAction, updateIsPending] = useActionState<
    FormStateCollection,
    FormData
  >(updateCollection, undefined);
  const prevUpdatePendingRef = useRef(false);
  const lastHandledUpdateStateRef = useRef<FormStateCollection | null>(null);

  // action state for delete
  const [deleteState, deleteAction, deleteIsPending] = useActionState<
    FormStateCollection,
    FormData
  >(deleteCollection, undefined);
  const prevDeletePendingRef = useRef(false);
  const lastHandledDeleteStateRef = useRef<FormStateCollection | null>(null);

  useEffect(() => {
    if (!prevUpdatePendingRef.current && updateIsPending)
      displayMessage({ type: "pending", message: "Updating collections..." });

    prevUpdatePendingRef.current = updateIsPending;
  }, [updateIsPending, displayMessage]);

  useEffect(() => {
    // if update state was the same as update state that was handled last time
    if (updateState === lastHandledUpdateStateRef.current || !updateState)
      return;

    lastHandledUpdateStateRef.current = updateState;

    if (updateState?.error) {
      displayMessage({
        type: "error",
        message:
          updateState?.error?.message || "Error occured. Plase try again.",
      });
      return;
    }

    if (updateState?.message) {
      displayMessage({
        type: "success",
        message: updateState?.message || "Collection updated",
      });

      handleUpdate();
    }
  }, [updateState, handleUpdate, displayMessage]);

  useEffect(() => {
    if (!prevDeletePendingRef.current && deleteIsPending)
      displayMessage({ type: "pending", message: "Deleting collection..." });

    prevDeletePendingRef.current = deleteIsPending;
  }, [deleteIsPending, displayMessage]);

  useEffect(() => {
    // if delete state was the same as delete state that was handled last time
    if (lastHandledDeleteStateRef.current === deleteState || !deleteState)
      return;

    lastHandledDeleteStateRef.current = deleteState;

    if (deleteState?.error) {
      displayMessage({
        type: "error",
        message:
          deleteState.error.message || "Error occured. Please try again.",
      });
      return;
    }

    if (deleteState?.message) {
      displayMessage({
        type: "success",
        message: deleteState.message || "Collection deleted",
      });

      handleUpdate();
    }
  }, [deleteState, deleteIsPending, displayMessage, handleUpdate]);

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
              {!isDeleted &&
                (!isEdited ? (
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
                ))}
              {!isEdited &&
                (!isDeleted ? (
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
                ))}
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
  data,
  type,
  isSelected,
  isAllSelected,
  isDeleted,
  isEdited,
}: {
  data: TYPE_COLLECTION;
  type: "main" | "addTo";
  isSelected: boolean;
  isAllSelected: boolean;
  isDeleted: boolean;
  isEdited: boolean;
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
      {!data.allWords && (isEdited || isDeleted) && (
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
        {!data.allWords && isEdited && isChecked ? (
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
