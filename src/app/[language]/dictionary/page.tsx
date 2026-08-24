"use client";
import Dictionary from "@/app/[language]/Components/Dictionary";
import ButtonGoBack from "../Components/ButtonGoBack";
import { usePathname } from "next/navigation";
import { getLanguageFromPathname } from "@/app/lib/helper";

export default function DictionaryPage() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-full h-[100dvh]">
      <Dictionary widthClassName="w-full" heightClassName="h-full"></Dictionary>
      {/* after making adding words async, I will change "navigateTo" to previous */}
      <ButtonGoBack language={language} navigateTo="main" />
    </div>
  );
}
