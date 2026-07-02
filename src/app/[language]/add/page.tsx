"use client";
import { getLanguageFromPathname } from "@/app/lib/helper";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Add() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const linkClassName =
    "w-[8rem] lg:w-[9rem] 2xl:w-[10rem] aspect-square flex flex-col justify-center text-center text-lg rounded-md shadow-lg shadow-black/20 text-black/70 bg-gradient-to-t transition-all duration-1000 px-2 leading-tight";

  const [collectionId, setCollectionId] = useState("");

  useEffect(() => {
    const getSetCollectionIdFromHash = () => {
      const collectionIdFromHash = window.location.hash.slice(1);

      setCollectionId(collectionIdFromHash);
    };

    getSetCollectionIdFromHash();
  }, []);

  return (
    <div className="w-full h-screen flex flex-col sm:flex-row justify-center items-center gap-8 md:gap-10 lg:gap-12 xl:gap-14 2xl:gap-16">
      <Link
        data-testid="linkRegisterManually"
        href={`${pathname}/manually#${collectionId}`}
        className={`${linkClassName}  from-orange-500 to-orange-200 hover:to-orange-300`}
      >
        {language === "en" ? (
          <>
            Register Word
            <br /> Manually
          </>
        ) : (
          <>
            単語を自分で
            <br />
            登録する
          </>
        )}
      </Link>
      <Link
        data-testid="linkRegisterDictionary"
        href={`/${language}/dictionary#${collectionId}`}
        className={`${linkClassName}  from-green-400 to-green-200 hover:to-green-300`}
      >
        {language === "en" ? (
          <>
            Register Word
            <br />
            from Dictionary
          </>
        ) : (
          <>
            辞書から
            <br />
            登録する
          </>
        )}
      </Link>
    </div>
  );
}
