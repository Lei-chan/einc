"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// method
import { getLanguageFromPathname } from "@/app/lib/helper";

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

  const isOnline = true;
  return (
    <div
      className={`absolute w-[100px] aspect-[1/0.5] left-3 lg:left-4 ${topClassName}`}
    >
      {/* // I will change this later */}
      {showOnlineMark && (
        <p className="w-fit text-right text-xs">
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
