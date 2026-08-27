import { Language } from "@/app/lib/config/types/others";

export default function Confirmation({
  language,
  whatToDelete,
  howManyToDelete,
  onClickClose,
  deleteAction,
}: {
  language: Language;
  whatToDelete: "collections" | "words";
  howManyToDelete: number;
  onClickClose: () => void;
  deleteAction: ((formData: FormData) => void) | (() => void);
}) {
  const btnClassName =
    "bg-orange-400 text-white tracking-wider w-fit px-1 rounded-sm transition-all duration-150 hover:bg-yellow-400 hover:-translate-y-0.5";
  const btnTexts = language === "en" ? "Yes" : "はい";

  type TYPE_COLLECTIONS_ACTION = (formData: FormData) => void;
  type TYPE_WORDS_ACTION = () => void;

  const getWhatToDeleteForLanguage = () => {
    if (language === "en") return whatToDelete;

    return whatToDelete === "collections" ? "コレクション" : "単語";
  };

  function handleClickDiv(e: React.MouseEvent<HTMLDivElement>) {
    const clickedElement = e.target;

    // if clicked element if div => then, close the confirmation overlay
    if (clickedElement === e.currentTarget) onClickClose();
  }

  return (
    <div
      data-testid="confirmation"
      className="fixed left-0 top-0 w-screen h-screen bg-black/30 z-50 flex flex-col items-center justify-center"
      onClick={handleClickDiv}
    >
      <p className="relative w-[80%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[20%] text-sm md:text-base bg-gradient-to-tl from-yellow-100 to-yellow-50 aspect-[2/1] rounded-md text-center p-2 flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 2xl:gap-7">
        <button
          data-testid="btnX"
          type="button"
          className="absolute right-1.5 -top-1 text-2xl md:text-3xl hover:text-amber-700"
          onClick={onClickClose}
        >
          ×
        </button>
        {howManyToDelete <= 0 &&
          (language === "en"
            ? `Please select more than 1 ${getWhatToDeleteForLanguage()}`
            : `１つ以上の${getWhatToDeleteForLanguage()}を選択してください`)}
        {howManyToDelete > 0 && (
          <>
            {language === "en"
              ? `Do you really want to delete ${howManyToDelete} ${getWhatToDeleteForLanguage()}?`
              : `${howManyToDelete}個の${getWhatToDeleteForLanguage()}を消去してしまってよろしいですか？`}
            {/* to delete collections, use form submit event with formAction */}
            {/* to delete words, use mouse click event with onClick */}
            {whatToDelete === "collections" ? (
              <button
                name="btnDeleteCollections"
                type="submit"
                className={btnClassName}
                formAction={deleteAction as TYPE_COLLECTIONS_ACTION}
              >
                {btnTexts}
              </button>
            ) : (
              <button
                data-testid="btnDeleteWords"
                type="button"
                className={btnClassName}
                onClick={deleteAction as TYPE_WORDS_ACTION}
              >
                {btnTexts}
              </button>
            )}
          </>
        )}
      </p>
    </div>
  );
}
