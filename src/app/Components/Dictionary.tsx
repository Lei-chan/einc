"use client";
import { useRef, useState } from "react";
import { TYPE_DICTIONARY } from "../lib/config/type";
import ButtonAudio from "./ButtonAudio";

export default function Dictionary({
  widthClassName,
  heightClassName,
}: {
  widthClassName: string;
  heightClassName: string;
}) {
  return (
    <div className={`${widthClassName} ${heightClassName}`}>
      <Top />
      <WordContainer />
    </div>
  );
}

function Top() {
  const [language, setLanguage] = useState("english");

  function handleChangeSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(e.currentTarget.value);
  }

  return (
    <form className="w-full h-20 bg-gradient-to-l from-green-300 to-green-300/60 shadow-md shadow-black/10 flex flex-row items-center justify-center gap-2">
      <input
        name="word"
        type="search"
        placeholder="search for..."
        className="w-1/2 h-[40%] rounded-full"
      ></input>
      <button
        type="submit"
        className="text-sm text-white bg-red-400 px-1 py-[2px] rounded shadow shadow-black/10"
      >
        Search
      </button>
      <select
        value={language}
        className="text-sm"
        onChange={handleChangeSelect}
      >
        <option value="english">English</option>
        <option value="japanese">Japanese</option>
        <option value="german">German</option>
        <option value="french">French</option>
        <option value="spanish">Spanish</option>
        <option value="chinese">Chinese</option>
        <option value="korean">Korean</option>
      </select>
    </form>
  );
}

function WordContainer() {
  return (
    <ul className="w-full h-full overflow-y-auto">
      <Word name="Hello" id=""></Word>
    </ul>
  );
}

function Word({ name, id }: { name: string; id: string }) {
  const liClassName = "border-b-2 py-2 px-4";
  const h3ClassName = "text-lg text-black";
  const btnPlusRef = useRef<HTMLButtonElement>(null);
  const btnAudioRef = useRef<HTMLButtonElement>(null);

  const [data, setData] = useState<TYPE_DICTIONARY | undefined>(undefined);
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
      className={`${liClassName} bg-white/50 text-xl font-medium hover:bg-white`}
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
              Add this
              <br />
              word
            </p>
          </div>
        </div>
      </div>
      <div>
        <h3 className={h3ClassName}>Definitions</h3>
        {data.definitions.length ? (
          data.definitions.map((def, i) => <p key={i}>• {def}</p>)
        ) : (
          <p>There&apos;re no definitions</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>Examples</h3>
        {data.examples.length ? (
          data.examples.map((exam, i) => <p key={i}>• {exam}</p>)
        ) : (
          <p>There&apos;re no examples</p>
        )}
      </div>
      <div>
        <h3 className={h3ClassName}>Synonym</h3>
        <p>
          {data.synonyms.length ? data.synonyms.join(" / ") : "no synonyms"}
        </p>
      </div>
    </li>
  );
}
