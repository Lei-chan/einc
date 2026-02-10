"use client";
import Dictionary from "@/app/Components/Dictionary";
import { formatDate } from "@/app/lib/helper";
import { use, useState } from "react";

export default function Journal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [date, setDate] = useState(new Date());

  return (
    <div className="w-screen h-screen">
      <Top />
      <Middle date={date} />
    </div>
  );
}

function Top() {
  return (
    <h1 className="w-full h-[10%] text-2xl text-white bg-gradient-to-t from-amber-800 to-amber-700 tracking-wide py-2 shadow-sm shadow-black/40 text-center">
      Journal
    </h1>
  );
}

function Middle({ date }: { date: Date }) {
  const arrowButtonClassName =
    "w-5 aspect-square bg-[url('/icons/arrow.svg')] bg-no-repeat bg-center bg-contain";
  const [isDictionaryOpen, setIsDectionaryOpen] = useState(false);

  function handleToggleDictionary() {
    setIsDectionaryOpen(!isDictionaryOpen);
  }

  return (
    <div className={`w-full h-[90%] pt-3 gap-3 items-center flex flex-col`}>
      <div
        className={`w-[90%] overflow-y-auto my-3 ${!isDictionaryOpen ? "flex-[1.7]" : "flex-1"}`}
      >
        <div className="flex flex-row justify-center gap-10">
          <button className={`${arrowButtonClassName} rotate-180`}></button>
          <p className="text-center">{formatDate(date, "en-US", true)}</p>
          <button
            className={`${arrowButtonClassName} ${date.getDate() === new Date().getDate() ? "opacity-0" : "opacity-100"}`}
          ></button>
        </div>
        <div
          contentEditable={true}
          className="w-full aspect-[1/1.5] mt-3 p-1 text-sm"
        ></div>
      </div>
      {!isDictionaryOpen ? (
        <div className="flex-[0.3] flex flex-col justify-center">
          <button
            className="w-fit h-fit bg-green-400 hover:bg-green-300 text-white px-2 rounded"
            onClick={handleToggleDictionary}
          >
            Search words with dictionary
          </button>
        </div>
      ) : (
        <div className="relative overflow-y-auto flex-1">
          <button
            className="absolute font-bold top-[2px] right-2 text-sm hover:text-amber-700"
            onClick={handleToggleDictionary}
          >
            &#10005;
          </button>
          <Dictionary widthClassName="w-full" heightClassName="h-full" />
        </div>
      )}
    </div>
  );
}
