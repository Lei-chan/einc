"use client";
// react
import {
  startTransition,
  useActionState,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
// next.js
import Link from "next/link";
// components
import CreateFolder from "./CreateFolder";
import ButtonPagination from "./ButtonPagination";
import PMessage from "./PMessage";
// reducer
import { checkboxReducer, paginationReducer } from "../../lib/reducers";
// actions
import {
  deleteCollection,
  updateCollection,
} from "../../actions/auth/collections";
// dal
// import { getCollectionDataCurPage } from "../../lib/dal";
import { getCollectionDataCurPage } from "@/app/lib/indexedDB/database";
// methods
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getNumberOfPages,
  wait,
} from "../../lib/helper";
// type
import {
  Language,
  ActionPaginationType,
  Collection,
  Collections,
  DisplayMessage,
} from "../../lib/config/types/others";
import { FormStateCollection } from "../../lib/config/types/formState";
// library
import { nanoid } from "nanoid";
import { usePathname } from "next/navigation";
import { IsOnline } from "@/app/lib/hooks";

export default function FolderPagination({ type }: { type: "main" | "addTo" }) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  // design
  const sm = 640;
  const md = 768;
  const lg = 1024;
  const numberOfRows = 5;

  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [collectionData, setCollectionData] = useState<
    | {
        collections: Collections;
        numberOfCollections: number;
      }
    | undefined
  >();

  const numberOfCollectionsPage = numberOfRows * numberOfColumns;
  const numberOfPages = getNumberOfPages(
    numberOfCollectionsPage,
    collectionData?.numberOfCollections || 0,
  );

  // others
  const [curPage, dispatch] = useReducer(paginationReducer, 1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSelected, setIsSelected] = useState(false);
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [messageData, setMessageData] = useState<DisplayMessage>(undefined);

  // display message for 3 seconds
  async function displayMessage(msgData: DisplayMessage) {
    setMessageData(msgData);
    await wait();
    setMessageData(undefined);
  }

  function handleSetIsUpdated() {
    setRefreshKey((prev) => prev + 1);
  }

  function handleToggleSelected() {
    setIsSelected(!isSelected);
  }

  function handleClickPagination(type: ActionPaginationType) {
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

      if (!collections) {
        setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });
        return;
      }

      setCollectionData(collections);
    };

    fetchCollectionData();
  }, [refreshKey, curPage, numberOfCollectionsPage, language]);

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

  useEffect(() => {
    const setSelectedToFalse = () => setIsSelected(false);

    setSelectedToFalse();
  }, [refreshKey]);

  return (
    <div className="relative flex-[5] w-full h-full flex flex-col items-center overflow-hidden">
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      <FolderContainer
        language={language}
        type={type}
        numberOfColumns={numberOfColumns}
        isSelected={isSelected}
        collections={collectionData?.collections}
        onClickSelected={handleToggleSelected}
        handleUpdate={handleSetIsUpdated}
        onClickCreate={handleToggleCreateFolder}
        displayMessage={displayMessage}
        dispatch={dispatch}
      />
      {!isSelected && (
        <ButtonPagination
          numberOfPages={numberOfPages}
          curPage={curPage}
          showNumber={true}
          onClickPagination={handleClickPagination}
        />
      )}
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
  language,
  type,
  numberOfColumns,
  isSelected,
  collections,
  onClickSelected,
  handleUpdate,
  onClickCreate,
  displayMessage,
  dispatch,
}: {
  language: Language;
  type: "main" | "addTo";
  numberOfColumns: number;
  isSelected: boolean;
  collections: Collections | undefined;
  onClickSelected: () => void;
  handleUpdate: () => void;
  onClickCreate: () => void;
  displayMessage: (msgData: DisplayMessage) => void;
  dispatch: (type: ActionPaginationType) => void;
}) {
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isDeleted, setIsDelete] = useState(false);
  const [isEdited, setIsEdited] = useState(false);

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
    <form className="w-full md:w-[95%] lg:w-[85%] xl:w-[80%] 2xl:w-[70%] flex-[4.5] p-4 flex flex-col items-center justify-center">
      {collections ? (
        <>
          {type === "main" && (
            <Selector
              language={language}
              isSelected={isSelected}
              isEdited={isEdited}
              isDeleted={isDeleted}
              onClickSelect={onClickSelected}
              handleUpdate={handleUpdate}
              onClickButton={onClickCreate}
              onChangeSelectAll={handleChangeSelectAll}
              onClickDelete={handleToggleDelete}
              onClickEdit={handleToggleEdit}
              displayMessage={displayMessage}
              dispatch={dispatch}
            />
          )}
          <ul
            className="w-full h-full grid grid-rows-5 items-center justify-items-center mt-2 md:mt-3"
            style={{
              gridTemplateColumns: `repeat(${numberOfColumns}, minmax(0, 1fr))`,
            }}
          >
            {collections &&
              collections.map((collection) => (
                <Folder
                  key={nanoid()}
                  language={language}
                  type={type}
                  data={collection}
                  isSelected={isSelected}
                  isAllSelected={isAllSelected}
                  isDeleted={isDeleted}
                  isEdited={isEdited}
                />
              ))}
          </ul>
        </>
      ) : (
        <p>{language === "en" ? "Loading..." : "ロード中..."}</p>
      )}
    </form>
  );
}

function Selector({
  language,
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
  dispatch,
}: {
  language: Language;
  isSelected: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  onClickSelect: () => void;
  handleUpdate: () => void;
  onClickButton: () => void;
  onChangeSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClickDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClickEdit: (e: React.MouseEvent<HTMLButtonElement>) => void;
  displayMessage: (msgData: DisplayMessage) => void;
  dispatch: (type: ActionPaginationType) => void;
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
      displayMessage({
        type: "pending",
        message:
          language === "en"
            ? "Updating collections..."
            : "コレクションを更新中...",
      });

    prevUpdatePendingRef.current = updateIsPending;
  }, [updateIsPending, language, displayMessage]);

  useEffect(() => {
    // if update state was the same as update state that was handled last time
    if (updateState === lastHandledUpdateStateRef.current || !updateState)
      return;

    lastHandledUpdateStateRef.current = updateState;

    if (updateState?.error?.message) {
      displayMessage({
        type: "error",
        message: updateState.error.message[language],
      });
      return;
    }

    if (updateState?.message) {
      displayMessage({
        type: "success",
        message: updateState.message[language],
      });

      handleUpdate();
    }
  }, [updateState, language, handleUpdate, displayMessage]);

  useEffect(() => {
    if (!prevDeletePendingRef.current && deleteIsPending) {
      // reset current page to 1
      dispatch("reset");

      displayMessage({
        type: "pending",
        message:
          language === "en"
            ? "Deleting collection..."
            : "コレクションを削除中...",
      });
    }

    prevDeletePendingRef.current = deleteIsPending;
  }, [deleteIsPending, language, displayMessage, dispatch]);

  useEffect(() => {
    // if delete state was the same as delete state that was handled last time
    if (lastHandledDeleteStateRef.current === deleteState || !deleteState)
      return;

    lastHandledDeleteStateRef.current = deleteState;

    if (deleteState.error?.message) {
      displayMessage({
        type: "error",
        message: deleteState.error.message[language],
      });
      return;
    }

    if (deleteState?.message) {
      displayMessage({
        type: "success",
        message: deleteState.message[language],
      });

      handleUpdate();
    }
  }, [deleteState, deleteIsPending, language, displayMessage, handleUpdate]);

  return (
    IsOnline() && (
      <div className="w-[95%] flex flex-row justify-end gap-2 md:gap-3 lg:gap-4 text-sm items-center">
        {
          <>
            {!isSelected ? (
              <button
                type="button"
                className={`${btnNewSelectClassName} w-fit h-[90%] leading-none bg-green-400 flex flex-row items-center text-[13px] py-0 hover:bg-green-300`}
                onClick={onClickButton}
              >
                <span className="text-xl mr-1">+</span>
                {language === "en" ? "New collection" : "新しいコレクション"}
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
                      {language === "en" ? "Edit name" : "名前を編集"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={btnEditClassName}
                      formAction={updateAction}
                    >
                      {language === "en" ? "Finish editing" : "編集を完了"}
                    </button>
                  ))}
                {!isEdited &&
                  (!isDeleted ? (
                    <button
                      type="button"
                      className="bg-orange-500 text-white py-[1px] px-1 mr-1 rounded"
                      onClick={onClickDelete}
                    >
                      {language === "en" ? "Delete" : "削除"}
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
                    {language === "en" ? "Select all" : "全てを選択"}:&nbsp;
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
              {isSelected && (language === "en" ? "Finish" : "終了")}
              {!isSelected && (language === "en" ? "Select" : "選択")}
            </button>
          </>
        }
      </div>
    )
  );
}

function Folder({
  language,
  data,
  type,
  isSelected,
  isAllSelected,
  isDeleted,
  isEdited,
}: {
  language: Language;
  data: Collection;
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
      {/* Remove the collection 'All' so it cannot be deleted or edited */}
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
        href={`/${language}/collection/${data._id}`}
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
            placeholder={language === "en" ? "new name" : "新しい名前"}
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
