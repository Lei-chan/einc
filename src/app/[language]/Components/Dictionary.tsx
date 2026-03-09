"use client";
// react
import { useRef, useState } from "react";
// next.js
import { usePathname } from "next/navigation";
// component
import ButtonAudio from "./ButtonAudio";
// method
import { getLanguageFromPathname } from "@/app/lib/helper";
import { DictionaryData, Language } from "@/app/lib/config/types/others";
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

  return (
    <div className={`${widthClassName} ${heightClassName} z-10`}>
      {/* For now */}
      <p className="absolute left-0 top-0 w-full h-full z-20 bg-black/50 text-white text-2xl text-center flex flex-col justify-center pointer-events-none">
        Coming Soon
      </p>
      <Top language={language} />
      <WordContainer language={language} />
    </div>
  );
}

function Top({ language }: { language: Language }) {
  const [dictionaryLanguage, setDictionaryLanguage] = useState("english");

  function handleChangeSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setDictionaryLanguage(e.currentTarget.value);
  }

  return (
    <form className="w-full h-20 bg-gradient-to-l from-green-300 to-green-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-2">
      <input
        name="word"
        type="search"
        placeholder={language === "en" ? "search for..." : "単語を検索"}
        className="w-1/2 md:w-[40%] lg:w-1/3 xl:w-1/4 2xl:w-1/5 h-[40%] rounded-full"
      ></input>
      <button
        type="submit"
        className="text-sm lg:text-base text-white bg-red-400 px-1 py-[2px] rounded shadow shadow-black/10"
      >
        {language === "en" ? "Search" : "検索"}
      </button>
      <select
        value={language}
        className={"text-sm lg:text-[15px]"}
        onChange={handleChangeSelect}
      >
        <option value="english">
          {language === "en" ? "English" : "英語"}
        </option>
        <option value="japanese">
          {language === "en" ? "Japanese" : "日本語"}
        </option>
        <option value="german">
          {language === "en" ? "German" : "ドイツ語"}
        </option>
        <option value="french">
          {language === "en" ? "French" : "フランス語"}
        </option>
        <option value="spanish">
          {language === "en" ? "Spanish" : "スペイン語"}
        </option>
        <option value="chinese">
          {language === "en" ? "Chinese" : "中国語"}
        </option>
        <option value="korean">
          {language === "en" ? "Korean" : "韓国語"}
        </option>
      </select>
    </form>
  );
}

function WordContainer({ language }: { language: Language }) {
  return (
    <ul className="w-full h-full overflow-y-auto">
      <Word language={language} name="Hello" id=""></Word>
    </ul>
  );
}

function Word({
  language,
  name,
  id,
}: {
  language: Language;
  name: string;
  id: string;
}) {
  const liClassName =
    "border-b-2 py-2 sm:py-3 md:py-4 px-4 sm:px-5 md:px-6 lg:px-7";
  const h3ClassName = "text-lg text-black";
  const btnPlusRef = useRef<HTMLButtonElement>(null);
  const btnAudioRef = useRef<HTMLButtonElement>(null);

  const [data, setData] = useState<DictionaryData | undefined>(undefined);
  const [isPlusHovered, setIsPlusHovered] = useState(false);

  async function handleClickWord(e: React.MouseEvent<HTMLLIElement>) {
    try {
      if (e.target === btnPlusRef.current || e.target === btnAudioRef.current)
        return;
      if (data) return setData(undefined);

      // Get word data from server
      setData({
        name: "Hello",
        pronunciationString: "hkhk",
        pronunciationAudio: "ddd",
        definitions: ["greeting"],
        examples: ["Hellow, Mike!"],
        synonyms: [],
      });
    } catch (err: unknown) {
      console.error("Error", err);
    }
  }

  function handleToggleHoverPlus() {
    setIsPlusHovered(!isPlusHovered);
  }

  return !data ? (
    <li
      className={`${liClassName} bg-white/50 text-xl lg:text-2xl font-medium hover:bg-white`}
      onClick={handleClickWord}
    >
      {name}
    </li>
  ) : (
    <li
      className={`${liClassName} bg-white flex flex-col gap-2`}
      onClick={handleClickWord}
    >
      <div className="w-full h-fit flex flex-row gap-5 items-center">
        <h2 className="text-2xl font-bold tracking-wide">{name}</h2>
        <div className="flex flex-row items-center gap-2">
          {data.pronunciationAudio && (
            <ButtonAudio src={data.pronunciationAudio} />
          )}
          <span>{data.pronunciationString}</span>
        </div>
        <div className="absolute right-1/4">
          <div className="relative flex flex-row items-center">
            <button
              ref={btnPlusRef}
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
        {data.definitions.length ? (
          data.definitions.map((def, i) => <p key={i}>• {def}</p>)
        ) : (
          <p>{language === "en" ? "No definitions" : "意味はありません"}</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>
          {language === "en" ? "Examples" : "例文"}
        </h3>
        {data.examples.length ? (
          data.examples.map((exam, i) => <p key={i}>• {exam}</p>)
        ) : (
          <p>{language === "en" ? "No examples" : "例文はありません"}</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>
          {language === "en" ? "Synonym" : "類義語"}
        </h3>
        <p>
          {data.synonyms.length > 0 && data.synonyms.join(" / ")}
          {data.synonyms.length === 0 && language === "en"
            ? "no synonyms"
            : "類義語はありません"}
        </p>
      </div>
    </li>
  );
}
