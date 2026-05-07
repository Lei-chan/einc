"use client";
// react
import {
  startTransition,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
// component
import FolderPagination from "@/app/[language]/Components/FolderPagination";
import {
  ReadonlyURLSearchParams,
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getNextReviewDate,
  syncMongoDBWithIndexedDB,
  wait,
} from "@/app/lib/helper";
import PMessage from "../Components/PMessage";
import {
  DictionaryData,
  DisplayMessage,
  WordBeforeSent,
  WordData,
} from "@/app/lib/config/types/others";
import { separator } from "@/app/lib/config/settings";
import { FormStateWordJournal } from "@/app/lib/config/types/formState";
import { addWords } from "@/app/actions/auth/words";

export default function AddTo() {
  const router = useRouter();
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);
  const searchParams = useSearchParams();

  const msgClassName = "text-white mx-3 mt-5 px-1 rounded text-center";

  const getWordDataFromParams = (searchParams: ReadonlyURLSearchParams) => {
    const definitions = searchParams.get("definitions");
    const examples = searchParams.get("examples");
    const synonyms = searchParams.get("synonyms");

    return {
      name: searchParams.get("name") || "",
      pronunciationString: searchParams.get("pronunciationString"),
      audio: searchParams.get("pronunciationAudio"),
      definitions: definitions || "",
      examples: examples || "",
      synonyms: synonyms || "",
      imageName: null,
      imageDefinitions: null,
      status: 0,
      nextReviewAt: getNextReviewDate(0),
    };
  };

  const wordData = getWordDataFromParams(searchParams);

  const [state, action, isPending] = useActionState<
    FormStateWordJournal,
    WordBeforeSent[]
  >(addWords, undefined);

  const [messageData, setMessageData] = useState<DisplayMessage>();

  async function handleClickCollection(collectionId: string) {
    try {
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
  }

  useEffect(() => {
    if (!state?.message) return;

    const redirect = async () => {
      try {
        if (!state.message) return;

        await syncMongoDBWithIndexedDB("words");

        setMessageData({
          type: "success",
          message: state.message[language],
        });

        await wait(2);

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

        router.push(`/${language}/dictionary`);
      }
    };

    redirect();
  }, [state?.message, language, router]);

  return (
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
        <h1 className="text-xl w-[85%] mt-3">
          {language === "en"
            ? "Add this word to"
            : "どのコレクションにこの単語を追加しますか？"}
        </h1>
        <FolderPagination
          type="addTo"
          onClickCollection={handleClickCollection}
          // displayError={displayError}
          // displayMessage={displayMessage}
        />
      </div>
    </div>
  );
}
