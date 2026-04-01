"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// method
import { getLanguageFromPathname } from "@/app/lib/helper";
import { IsOnline } from "@/app/lib/hooks";

export default function LogoOnlineMark({
  showOnlineMark,
  topClassName,
}: {
  showOnlineMark: boolean;
  topClassName?: string;
}) {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const pathsTogoToHomePage = [
    `/${language}`,
    `/${language}/login`,
    `/${language}/sign-up`,
  ];

  const isOnline = IsOnline();

  return (
    <div
      className={`absolute w-[100px] aspect-[1/0.5] left-3 lg:left-4 ${topClassName}`}
    >
      {showOnlineMark && (
        <p
          className={`w-fit text-right text-xs ${language === "en" && "tracking-wider"}`}
        >
          {isOnline && `🟢 ${language === "en" ? "Online" : "オンライン"}`}{" "}
          {!isOnline && `🟡 ${language === "en" ? "Offline" : "オフライン"}`}
        </p>
      )}
      <Link
        href={
          pathsTogoToHomePage.includes(pathname)
            ? `/${language}`
            : `/${language}/main`
        }
        className={`absolute w-[95%] h-[80%] bg-[url('/einc-logo.PNG')] bg-no-repeat bg-contain bg-center`}
      />
    </div>
  );
}
