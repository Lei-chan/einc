"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// components
import Logo from "../Components/Logo";
import LinkAddVocab from "../Components/LinkAddVocab";
import FolderPagination from "../Components/FolderPagination";
// dal
import { logout } from "@/app/lib/dal";
// methods
import { getLanguageFromPathname } from "@/app/lib/helper";
// type
import { Language } from "@/app/lib/config/types/others";
import OnlineMark from "../Components/OnlineMark";

export default function Main() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center">
      <Top language={language} />
      <FolderPagination type="main" />
      <ButtonLogout language={language} />
      <OnlineMark language={language} />
    </div>
  );
}

function Top({ language }: { language: Language }) {
  const btnClassName = "h-full bg-top bg-no-repeat text-xs";

  return (
    <div className="relative w-full h-fit flex flex-row items-center flex-1">
      <Logo topClassName="top-3" />
      <div className="absolute w-[55%] h-[70%] flex flex-row items-center justify-center gap-[6%] right-2 text-center">
        <Link
          href="/dictionary"
          className={`${btnClassName} w-[30%] bg-[url('/icons/dictionary.svg')] bg-[length:60%] pt-[20%]`}
        >
          {language === "en" ? "Dictionary" : "辞書"}
        </Link>
        <LinkAddVocab language={language} collectionId="" />
        <Link
          href="/account"
          className={`${btnClassName} w-[28%] aspect-square bg-[url('/icons/account.svg')] bg-[length:63%] mt-[1%] pt-[20%]`}
        >
          {language === "en" ? "Account" : "アカウント"}
        </Link>
      </div>
    </div>
  );
}

function ButtonLogout({ language }: { language: Language }) {
  return (
    <button
      className="fixed w-fit bg-blue-400 text-white  rounded py-[2px] px-1 text-sm self-center bottom-3 transition-all duration-200 shadow-md shadow-black/20 hover:translate-y-[-1px] hover:bg-blue-300"
      onClick={logout}
    >
      {language === "en" ? "Logout" : "ログアウト"}
    </button>
  );
}
