"use client";

import { BASE_URL, LOCAL_URL } from "@/app/lib/config/settings";
import { Language } from "@/app/lib/config/types/others";
import { useRouter } from "next/navigation";

// add this to add-to, collection, list, journal, account next
export default function ButtonGoBack({
  language,
  navigateTo,
}: {
  language: Language;
  navigateTo: "previous" | "main";
}) {
  const router = useRouter();

  function handleClick() {
    if (navigateTo === "previous") {
      router.back();
      return;
    }

    // if it's a test or dev mode => use localhost, otherwise use production url
    router.push(
      `${process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development" ? LOCAL_URL : BASE_URL}/${language}/main`,
    );
  }

  return (
    <button
      type="button"
      className="fixed z-50 left-5 bottom-5 bg-black/30 rounded text-white text-xs xl:text-sm  2xl:text-base leading-tight p-1.5 xl:p-2 2xl:p-2.5 transition-all duration-150 hover:-translate-y-1 hover:bg-black/40"
      onClick={handleClick}
    >
      {language === "en"
        ? "Go back to"
        : navigateTo === "previous"
          ? "前のページに"
          : "メインページに"}
      <br />
      {language === "en" ? `${navigateTo} page` : "戻る"}
    </button>
  );
}
