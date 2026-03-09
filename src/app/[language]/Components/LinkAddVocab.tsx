// next.js
import Link from "next/link";
// type
import { Language } from "@/app/lib/config/types/others";

export default function LinkAddVocab({
  language,
  collectionId,
}: {
  language: Language;
  collectionId: string;
}) {
  return (
    <Link
      href={{ pathname: `/${language}/add`, hash: collectionId }}
      className="w-[20%] h-full bg-top bg-no-repeat text-xs bg-[url('/icons/plus.svg')] bg-[length:65%] mt-[4%] pt-[18%]"
      scroll={false}
    >
      {language === "en" ? "Add" : "追加"}
    </Link>
  );
}
