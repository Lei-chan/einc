"use client";
// react
import { useCallback, useEffect, useRef, useState } from "react";
// next.js
import { usePathname } from "next/navigation";
// component
import ButtonAudio from "./ButtonAudio";
// method
import {
  getGenericErrorMessage,
  getLanguageFromPathname,
  getNumberOfPages,
  isArrayEmpty,
} from "@/app/lib/helper";
import {
  DictionaryData,
  DictionaryLanguage,
  DisplayMessage,
  Language,
} from "@/app/lib/config/types/others";
import {
  DICTIONARY_LANGUAGES_FOR_MULTILANGUAGES,
  DICTIONARY_ONE_PAGE,
} from "@/app/lib/config/settings";
import { dictionary } from "@/app/lib/dal";
import PMessage from "./PMessage";
import Image from "next/image";
// types

export default function Dictionary({
  widthClassName,
  heightClassName,
}: {
  widthClassName: string;
  heightClassName: string;
}) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const dictionaryRef = useRef<HTMLDivElement>(null);

  const [dictionaryLanguage, setDictionaryLanguage] =
    useState<DictionaryLanguage>("en");
  const [searchLanguage, setSearchLanguage] =
    useState<DictionaryLanguage>("en");

  const [searchedWord, setSearchedWord] = useState("");

  const [numberOfPages, setNumberOfPages] = useState(0);
  const [results, setResults] = useState<DictionaryData[] | undefined>();
  const [curPage, setCurPage] = useState(0);

  const [isPending, setIsPending] = useState(false);
  const [messageData, setMessageData] = useState<undefined | DisplayMessage>();

  function handleChangeDictionaryLanguage(
    e: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const dictLanguage = e.currentTarget.value as DictionaryLanguage;
    setDictionaryLanguage(dictLanguage);
    setResults([]);
    setCurPage(0);
  }

  function handleChangeSearchLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    const searchLanguage = e.currentTarget.value as DictionaryLanguage;
    setSearchLanguage(searchLanguage);
    setResults([]);
    setCurPage(0);
  }

  const fetchDictionaryData = useCallback(async () => {
    setMessageData(undefined);
    setIsPending(true);

    const dictionaryData = await dictionary(
      searchedWord,
      dictionaryLanguage,
      searchLanguage,
      curPage,
    );

    if (dictionaryData === undefined) {
      setIsPending(false);
      return;
    }

    if (dictionaryData === null) {
      setIsPending(false);
      setMessageData({
        type: "error",
        message: getGenericErrorMessage(language),
      });
      return;
    }

    // Add results for curPage to the already rendered results
    setResults((prev) =>
      !prev ? dictionaryData.results : [...prev, ...dictionaryData.results],
    );

    setNumberOfPages(
      getNumberOfPages(
        DICTIONARY_ONE_PAGE,
        dictionaryData.totalNumberOfResults,
      ),
    );

    setIsPending(false);
  }, [language, dictionaryLanguage, searchLanguage, curPage, searchedWord]);

  async function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const word = String(formData.get("word")).trim();

    setSearchedWord(word);

    // reset curPage and results
    setCurPage(0);
    setResults([]);

    // await fetchDictionaryData(word, 0, []);
  }

  // when user scrolls down to the bottom of the page => add curPage to render more words
  useEffect(() => {
    const scrollEventHandler = () => {
      // run only there are search results
      if (!results || results.length === 0) return;

      const bottomOfContainer =
        dictionaryRef.current?.getBoundingClientRect().bottom;

      if (!bottomOfContainer) return;

      if (window.innerHeight + window.scrollY === document.body.scrollHeight)
        setCurPage((prev) => (prev === numberOfPages ? prev : prev + 1));
    };

    window.addEventListener("scroll", scrollEventHandler);

    return () => window.removeEventListener("scroll", scrollEventHandler);
  }, [numberOfPages, results]);

  useEffect(() => {
    const setDictionaryData = async () => await fetchDictionaryData();

    setDictionaryData();
  }, [curPage, searchedWord, fetchDictionaryData]);

  return (
    <div
      ref={dictionaryRef}
      className={`${widthClassName} ${heightClassName} z-10 flex flex-col items-center`}
    >
      <Top
        language={language}
        dictionaryLanguage={dictionaryLanguage}
        searchLanguage={searchLanguage}
        onChangeDictionaryLanguage={handleChangeDictionaryLanguage}
        onChangeSearchLanguage={handleChangeSearchLanguage}
        onSubmitSearch={handleSubmitSearch}
      />
      {messageData && (
        <PMessage type={messageData.type} message={messageData.message} />
      )}
      <WordContainer
        language={language}
        isPending={isPending}
        results={results}
      />
    </div>
  );
}

function Top({
  language,
  dictionaryLanguage,
  searchLanguage,
  onChangeDictionaryLanguage,
  onChangeSearchLanguage,
  onSubmitSearch,
}: {
  language: Language;
  dictionaryLanguage: DictionaryLanguage;
  searchLanguage: DictionaryLanguage;
  onChangeDictionaryLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeSearchLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const selectClassName = "w-1/2 sm:w-fit text-xs";

  return (
    <form
      className="relative w-full h-fit bg-gradient-to-l from-green-300 to-green-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-1 sm:gap-3 px-1 py-2 sm:py-4"
      onSubmit={onSubmitSearch}
    >
      <input
        name="word"
        type="search"
        placeholder={language === "en" ? "search for..." : "単語を検索"}
        className="w-1/2 sm:w-1/3 lg:w-[28%] xl:w-1/4 2xl:w-1/5 text-sm rounded-full py-1"
      ></input>
      <button
        type="submit"
        className="text-xs lg:text-sm text-white bg-red-400 px-1 py-[2px] rounded shadow shadow-black/10"
      >
        {language === "en" ? "Search" : "検索"}
      </button>
      <div className="sm:absolute w-fit flex flex-col lg:flex-row right-3 xl:right-5 2xl:right-7 lg:gap-2">
        <div className="flex flex-row gap-1">
          <select
            value={searchLanguage}
            className={selectClassName}
            onChange={onChangeSearchLanguage}
          >
            {DICTIONARY_LANGUAGES_FOR_MULTILANGUAGES.map((lang, i) => (
              <option key={i} value={lang.language}>
                {lang.languageForMultiLanguage[language]}
              </option>
            ))}
          </select>
          <p> - </p>
          <select
            value={dictionaryLanguage}
            className={selectClassName}
            onChange={onChangeDictionaryLanguage}
          >
            {DICTIONARY_LANGUAGES_FOR_MULTILANGUAGES.map((lang, i) => (
              <option key={i} value={lang.language}>
                {lang.languageForMultiLanguage[language]}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-right">
          {language === "en" ? "dictionary" : "辞書"}
        </p>
      </div>
    </form>
  );
}

function WordContainer({
  language,
  isPending,
  results,
}: {
  language: Language;
  isPending: boolean;
  results: DictionaryData[] | undefined;
}) {
  return !results || isArrayEmpty(results) ? (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isPending ? (
        <Image
          src="/icons/loading.png"
          alt="loading icon"
          width={30}
          height={30}
          className="animate-spin opacity-70"
        ></Image>
      ) : (
        <p className="text-xl opacity-70 self-center">
          {!results ? (
            <>
              {language === "en"
                ? "Let's start by searching!"
                : "検索して始めましょう！"}
            </>
          ) : (
            <>{language === "en" ? "No search results" : "検索結果０件"}</>
          )}
        </p>
      )}
    </div>
  ) : (
    <ul className="w-full h-full overflow-y-auto">
      {results.map((result, i) => (
        <Word key={i} language={language} result={result}></Word>
      ))}
    </ul>
  );
}

function Word({
  language,
  result,
  // name,
  // id,
}: {
  language: Language;
  result: DictionaryData;
  // name: string;
  // id: string;
}) {
  const liClassName =
    "border-b-2 py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 lg:px-7";
  const h3ClassName = "text-lg text-black";

  // const [data, setData] = useState<DictionaryData | undefined>(undefined);
  const [isClicked, setIsClicked] = useState(false);
  const [isPlusHovered, setIsPlusHovered] = useState(false);

  async function handleClickWord(e: React.MouseEvent<HTMLLIElement>) {
    if ((e.target as HTMLElement).tagName === "BUTTON") return;

    setIsClicked(!isClicked);
  }

  function handleToggleHoverPlus() {
    setIsPlusHovered(!isPlusHovered);
  }

  return !isClicked ? (
    <li
      className={`${liClassName} bg-white/50 text-xl lg:text-2xl font-medium hover:bg-white`}
      onClick={handleClickWord}
    >
      {result.name}
    </li>
  ) : (
    <li
      className={`${liClassName} bg-white flex flex-col gap-2`}
      onClick={handleClickWord}
    >
      <div className="relative w-full h-fit flex flex-row gap-5 items-center">
        <h2 className="text-2xl font-bold tracking-wide">{result.name}</h2>
        <div className="flex flex-row items-center gap-2">
          {result.pronunciationAudio && (
            <ButtonAudio src={result.pronunciationAudio} />
          )}
          <span>{result.pronunciationString}</span>
        </div>
        <div className="absolute right-1/4">
          <div className="relative flex flex-row items-center">
            <button
              type="button"
              className="h-10 text-6xl flex flex-col justify-center"
              onMouseEnter={handleToggleHoverPlus}
              onMouseLeave={handleToggleHoverPlus}
            >
              +
            </button>
            <p
              className={`absolute w-fit left-[100%] transition-all duration-500 whitespace-nowrap pointer-events-none text-sm mt-[30%] ml-2 ${isPlusHovered ? "opacity-100" : "opacity-0"}`}
            >
              {language === "en" ? "Add this" : "この単語を"}
              <br />
              {language === "en" ? "word" : "追加する"}
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3 className={h3ClassName}>
          {language === "en" ? "Definitions" : "意味"}
        </h3>
        {result.definitions.length ? (
          result.definitions.map((def, i) => <p key={i}>• {def}</p>)
        ) : (
          <p>{language === "en" ? "No definitions" : "意味はありません"}</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>
          {language === "en" ? "Examples" : "例文"}
        </h3>
        {result.examples.length ? (
          result.examples.map((exam, i) => <p key={i}>• {exam}</p>)
        ) : (
          <p>{language === "en" ? "No examples" : "例文はありません"}</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>
          {language === "en" ? "Synonym" : "類義語"}
        </h3>
        <p>
          {result.synonyms.length > 0 && result.synonyms.join(" / ")}
          {result.synonyms.length === 0 && language === "en"
            ? "no synonyms"
            : "類義語はありません"}
        </p>
      </div>
    </li>
  );
}
