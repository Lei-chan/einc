"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// method
import { getLanguageFromPathname } from "@/app/lib/helper";

export default function Logo({ topClassName }: { topClassName?: string }) {
  const pathname = usePathname();
  const languagePath = `/${getLanguageFromPathname(pathname)}`;

  const pathsTogoToHomePage = [
    languagePath,
    `${languagePath}/login`,
    `${languagePath}/sign-up`,
  ];

  return (
    <Link
      href={
        pathsTogoToHomePage.includes(pathname)
          ? languagePath
          : `${languagePath}/main`
      }
      className={`absolute w-[100px] aspect-[1/0.5] bg-[url('/einc-logo.PNG')] bg-no-repeat bg-contain bg-center left-3 ${topClassName}`}
    />
  );
}
