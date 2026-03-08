"use client";
import { Language } from "@/app/lib/config/types/others";

export default function OnlineMark({ language }: { language: Language }) {
  // I will change this later
  const isOnline = true;
  return (
    <p className="absolute w-fit left-2 top-1  text-right text-xs">
      {isOnline && `🟢 ${language === "en" ? "Online" : "オンライン"}`}{" "}
      {!isOnline && `🟡 ${language === "en" ? "Offline" : "オフライン"}`}
    </p>
  );
}
