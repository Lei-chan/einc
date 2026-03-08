"use client";
// react
import { useEffect, useState } from "react";
// next.js
import { usePathname } from "next/navigation";
// method
import { getLanguageFromPathname } from "@/app/lib/helper";

export default function AccountClosed() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const [opacity, setOpacity] = useState("opacity-0");

  useEffect(() => {
    const changeOpacityWhenMounted = () => setOpacity("opacity-100");
    changeOpacityWhenMounted();
  }, []);

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center bg-white/90 transition-all duration-[3000ms] ${opacity}`}
    >
      <p className="w-[80%] text-lg text-center text-black/70">
        {language === "en"
          ? "Thank you for using einc!"
          : "eincをご利用いただきありがとうございました！"}
        <br />
        {language === "en"
          ? "We hope to see you again :)"
          : "またお会いできるのを楽しみにしております"}
      </p>
    </div>
  );
}
