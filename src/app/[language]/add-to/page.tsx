"use client";
// react
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
// context
import { useMessage } from "@/app/lib/contexts/messageContext";
// component
import FolderPagination from "@/app/[language]/Components/FolderPagination";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getMessagesFromFieldError,
  getNextReviewDate,
} from "@/app/lib/helper";
import PMessage from "../Components/PMessage";
import { DisplayMessage, WordBeforeSent } from "@/app/lib/config/types/others";
import { FormStateWordJournal } from "@/app/lib/config/types/formState";
import { addWords } from "@/app/actions/auth/words";
import { registerData } from "@/app/lib/indexedDB/database";
import { separator } from "@/app/lib/config/settings";
import ButtonGoBack from "../Components/ButtonGoBack";

export default function AddTo() {
  const router = useRouter();
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);
  const searchParams = useSearchParams();

  const { showMessage } = useMessage();

  const [collectionId, setCollectionId] = useState("");
  const [messageData, setMessageData] = useState<DisplayMessage>();

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    WordBeforeSent[]
  >(addWords, undefined);

  const getWordDataFromParams = (searchParams: ReadonlyURLSearchParams) => {
    const definitions = searchParams.get("definitions");
    const examples = searchParams.get("examples");
    const synonyms = searchParams.get("synonyms");

    return {
      name: searchParams.get("name") || "",
      pronunciationString: searchParams.get("pronunciationString"),
      audio: searchParams.get("pronunciationAudio"),
      // change the separator with \n (new line) for the server helper function 'convertWordDataToSendServer'
      definitions: definitions?.split(separator).join("\n") || "",
      examples: examples?.split(separator).join("\n") || "",
      synonyms: synonyms || "",
      imageName: null,
      imageDefinitions: null,
      status: 0,
      nextReviewAt: getNextReviewDate(0),
    };
  };

  const handleClickCollection = useCallback(
    (collectionId: string) => {
      const wordData = getWordDataFromParams(searchParams);

      // reset message data
      setMessageData(undefined);

      const wordDataWithId = { ...wordData, collectionId };

      // adding words async in the background; message will appear with the showMessage context
      addWords(undefined, [wordDataWithId])
        .then(async (result) => {
          if ("error" in result && result.error.message) {
            showMessage("error", result.error.message[language]);
            return;
          }

          if ("errors" in result && result.errors) {
            showMessage(
              "error",
              getMessagesFromFieldError(language, result.errors),
            );
            return;
          }

          if ("data" in result && result.data)
            await registerData("words", result.data);

          if ("message" in result && result.message)
            showMessage("success", result.message[language]);
        })
        .catch((err) => {
          console.error("Error", err);
          showMessage("error", getGenericErrorMessage(language));
        });

      router.push(`/${language}/dictionary#${collectionId}`);
    },
    [language, searchParams, router, showMessage],
  );

  // If there is a collectionId in hash => use it to add a word
  useEffect(() => {
    const wordData = getWordDataFromParams(searchParams);
    if (!wordData) return;

    const getSetCollectionId = async () => {
      const collectionIdFromHash = window.location.hash.slice(1);

      if (!collectionIdFromHash) return;
      setCollectionId(collectionIdFromHash);

      handleClickCollection(collectionIdFromHash);
    };

    getSetCollectionId();
  }, [handleClickCollection, searchParams]);

  return (
    <>
      {/* {collectionId && (
        <div className="w-full h-[100dvh] overflow-hidden bg-black/30 cursor-wait z-0 fixed top-0 left-0"></div>
      )} */}
      <div className="w-full h-[100dvh] overflow-hidden">
        <div className="relative w-full h-full flex flex-col items-center">
          {!collectionId && (
            <h1 className="text-xl w-[85%] mt-3">
              {language === "en"
                ? "Add this word to"
                : "どのコレクションにこの単語を追加しますか？"}
            </h1>
          )}
          <FolderPagination
            type="addTo"
            onClickCollection={handleClickCollection}
          />
        </div>
        {!collectionId && (
          <ButtonGoBack language={language} navigateTo="previous" />
        )}
      </div>
    </>
  );
}
