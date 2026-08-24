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
  getNextReviewDate,
  wait,
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

  const [collectionId, setCollectionId] = useState("");
  const [messageData, setMessageData] = useState<DisplayMessage>();

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    WordBeforeSent[]
  >(addWords, undefined);
  const alreadyHandledRef = useRef<boolean>(false);

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
    async (collectionId: string) => {
      try {
        const wordData = getWordDataFromParams(searchParams);

        // reset message data
        setMessageData(undefined);

        const wordDataWithId = { ...wordData, collectionId };

        startTransition(() => action([wordDataWithId]));
      } catch (err) {
        console.error("Error", err);
        setMessageData({
          type: "error",
          message: getGenericErrorMessage(language),
        });
      }
    },
    [action, language, searchParams],
  );

  useEffect(() => {
    if (!state?.message || alreadyHandledRef.current) return;
    alreadyHandledRef.current = true;

    const redirect = async () => {
      try {
        if (!state.message) return;

        if (state.data) await registerData("words", state.data);

        setMessageData({
          type: "success",
          message: state.message[language],
        });

        await wait(1.5);

        setMessageData({
          type: "pending",
          message:
            language === "en"
              ? "Redirecting to the dictionary page..."
              : "辞書ページに移動中...",
        });
      } catch (err) {
        console.error("Error", err);
        setMessageData({
          type: "error",
          message:
            language === "en"
              ? "Unexpected error occured 🙇‍♂️ There was possibility that the word wasn't registered properly in local database. Please check the collection later."
              : "予期せぬエラーが発生しました🙇‍♂️単語がローカルデータベースに正しく保存されなかった可能性があります。後ほどコレクションをご確認ください。",
        });
      } finally {
        await wait(2);

        router.push(`/${language}/dictionary#${collectionId}`);
      }
    };

    redirect();
  }, [state, language, router, collectionId]);

  // If there is a collectionId in hash => use it to add a word
  useEffect(() => {
    const wordData = getWordDataFromParams(searchParams);
    if (!wordData) return;

    const getSetCollectionId = async () => {
      const collectionIdFromHash = window.location.hash.slice(1);

      if (!collectionIdFromHash) return;
      setCollectionId(collectionIdFromHash);

      await handleClickCollection(collectionIdFromHash);
    };

    getSetCollectionId();
  }, [handleClickCollection, searchParams]);

  return (
    <>
      {collectionId && (
        <div className="w-full h-[100dvh] overflow-hidden bg-black/30 cursor-wait z-0 fixed top-0 left-0"></div>
      )}
      <div className="w-full h-[100dvh] overflow-hidden">
        <div className="relative w-full h-full flex flex-col items-center">
          {messageData && (
            <PMessage type={messageData.type} message={messageData.message} />
          )}
          {isPending && (
            <PMessage
              type="pending"
              message={
                language === "en"
                  ? "Adding to the collection..."
                  : "コレクションに追加中..."
              }
            />
          )}
          {state?.error?.message && (
            <PMessage type="error" message={state.error.message[language]} />
          )}
          {state?.errors?.message && (
            <PMessage type="error" message={state.errors.message[language]} />
          )}
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
        {!collectionId && !messageData && !isPending && (
          <ButtonGoBack language={language} navigateTo="previous" />
        )}
      </div>
    </>
  );
}
