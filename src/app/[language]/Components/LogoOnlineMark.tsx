"use client";
// next.js
import Link from "next/link";
import { usePathname } from "next/navigation";
// method
import {
  getLanguageFromPathname,
  syncMongoDBWithIndexedDB,
} from "@/app/lib/helper";
import { IsOnline } from "@/app/lib/hooks";
import { useEffect, useState } from "react";
import Image from "next/image";
import PMessage from "./PMessage";
import { sendIndexedDBToMongoDB } from "@/app/lib/dal";
import { getAllIndexedDBData } from "@/app/lib/indexedDB/database";

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

  const [isSyncing, setIsSyncing] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  useEffect(() => {
    if (!isOnline || !showOnlineMark) {
      setIsSyncing(false);
      setIsErrorVisible(false);
      return;
    }

    const isAlreadySynced =
      sessionStorage.getItem("isAlreadySynced") === "true";

    const runSync = async () => {
      try {
        setIsSyncing(true);

        // push local changes to MongoDB
        if (isAlreadySynced) {
          const indexedDBData = await getAllIndexedDBData();
          await sendIndexedDBToMongoDB(indexedDBData);
        }

        // pull MongoDB into IndexedDB when first load
        if (!isAlreadySynced) {
          await syncMongoDBWithIndexedDB("all");
          // set data 'isAlreadySynced' in sessionStorage
          sessionStorage.setItem("isAlreadySynced", "true");
        }
      } catch (err) {
        setIsErrorVisible(true);
      } finally {
        setIsSyncing(false);
      }
    };

    runSync();
  }, [pathname, isOnline, showOnlineMark]);

  return (
    <div className="w-full h-12 flex flex-col items-center">
      {isErrorVisible && (
        <PMessage
          type="error"
          message={
            language === "en"
              ? "Server error. Please reload and try again 🙇‍♂️"
              : "サーバーエラーが発生しました。リロードしてもう一度お試し下さい🙇‍♂️"
          }
        />
      )}
      <div
        className={`absolute w-[100px] aspect-[1/0.5] left-3 lg:left-4 ${topClassName}`}
      >
        <div className="w-full h-fit text-xs">
          {showOnlineMark && (
            <>
              <p
                className={`w-fit ${language === "en" ? "tracking-wider" : ""}`}
              >
                {isOnline &&
                  `🟢 ${language === "en" ? "Online" : "オンライン"}`}{" "}
                {!isOnline &&
                  `🟡 ${language === "en" ? "Offline" : "オフライン"}`}
              </p>
              {isSyncing && (
                <p className="flex flex-row gap-1 items-center animate-pulse">
                  <Image
                    src="/icons/sync.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="object-contain"
                  ></Image>
                  <span>
                    {language === "en" ? " Syncing..." : " 同期中..."}
                  </span>
                </p>
              )}
            </>
          )}
        </div>
        <Link
          href={
            pathsTogoToHomePage.includes(pathname)
              ? `/${language}`
              : `/${language}/main`
          }
          className={`absolute w-[95%] h-[80%] bg-[url('/einc-logo.PNG')] bg-no-repeat bg-contain bg-center`}
        />
      </div>
    </div>
  );
}
