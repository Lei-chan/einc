"use client";
// react
import { useState } from "react";
// component
import FolderPagination from "@/app/[language]/Components/FolderPagination";
import { usePathname } from "next/navigation";
import { getLanguageFromPathname } from "@/app/lib/helper";
import PMessage from "../Components/PMessage";

export default function AddTo() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const msgClassName = "text-white mx-3 mt-5 px-1 rounded text-center";
  // const [error, setError] = useState("");
  // const [message, setMessage] = useState("");

  // function displayError(msg: string) {
  //   setError(msg);
  // }

  // function displayMessage(msg: string) {
  //   setMessage(msg);
  // }

  return (
    <div className="w-full h-[100dvh] overflow-hidden">
      <div className="relative w-full h-full flex flex-col items-center">
        {/* {error && <PMessage type="error" message={error} />}
        {message && <PMessage type="success" message={message} />} */}
        <h1 className="text-xl w-[85%] mt-3">
          {language === "en"
            ? "Add this word to"
            : "どのコレクションにこの単語を追加しますか？"}
        </h1>
        <FolderPagination
          type="addTo"
          // displayError={displayError}
          // displayMessage={displayMessage}
        />
      </div>
    </div>
  );
}
