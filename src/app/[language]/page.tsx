"use client";
//next.js
import Image from "next/image";
import Link from "next/link";
//components
import Logo from "./Components/Logo";
//libraries
import { useInView } from "react-intersection-observer";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doesPathnameContainLanguage,
  getLanguageFromPathname,
} from "../lib/helper";
import { Language } from "../lib/config/types/others";

export default function Home() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-screen h-fit flex flex-col items-center">
      <Top pathname={pathname} />
      <Middle language={language} />
      <Footer />
    </div>
  );
}

function Top({ pathname }: { pathname: string }) {
  const router = useRouter();

  const [language, setLanguage] = useState(getLanguageFromPathname(pathname));

  function handleChangeLanguage(e: React.ChangeEvent<HTMLSelectElement>) {
    setLanguage(e.currentTarget.value as Language);
  }

  useEffect(() => {
    const pathnameWithoutLanguage = doesPathnameContainLanguage(pathname)
      ? pathname.slice(3)
      : pathname;

    router.push(`/${language}${pathnameWithoutLanguage}`);
  }, [language, pathname, router]);
  return (
    <div className="fixed w-full h-[14vh] left-0 top-0 bg-gradient-to-r from-yellow-200 to-orange-300 flex flex-row items-center shadow-md shadow-black/10 z-10">
      <Logo />
      <div className="absolute w-[60%] h-fit flex flex-row text-[15px] gap-3 right-4 text-red-600 text-center items-center leading-tight justify-end ">
        <select
          value={language}
          className="w-[30%] bg-[url('/icons/language.svg')] bg-[2px] bg-contain bg-no-repeat text-sm pl-6 pr-2 appearance-none"
          onChange={handleChangeLanguage}
        >
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>
        <Link href={`/${language}/login`}>
          {language === "en" ? "Login" : "ログイン"}
        </Link>
        <Link href={`/${language}/sign-up`}>
          {language === "en" ? "Sign-up" : "登録"}
        </Link>
      </div>
    </div>
  );
}

function Middle({ language }: { language: Language }) {
  const transitionClassName = "transition-all duration-1000";
  const inViewOptions = {
    threshold: 0.5,
    triggerOnce: true,
  };

  const [firstRef, firstInView, firstEntry] = useInView(inViewOptions);
  const [lastRef, lastInView, lastEntry] = useInView(inViewOptions);

  return (
    <div className="w-[90%] h-fit mt-[14vh] py-10 flex flex-col items-center">
      <div
        ref={firstRef}
        className={`w-full ease-in ${transitionClassName} ${
          firstInView ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* I will change it to Image later */}
        <div className="w-full h-auto aspect-[1/0.6] bg-slate-400"></div>
        <p className="text-lg bg-gradient-to-r from-white to-white/80 py-2 px-4 shadow-black/10 shadow-lg rounded-md mt-3 text-red-700 italic">
          &quot;einc&quot;
          {language === "en"
            ? " will help you memorize vocabulary or expressions more efficiently!"
            : "はより効率的に単語や表現を覚えるのを助けます！"}
        </p>
      </div>
      <div className="w-[90%] py-3">
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description={
            language === "en"
              ? "You can learn vocabulary you registered by lists, frashcards, and quiz"
              : "登録した単語をリスト、暗記帳、クイズの機能を使用して勉強ができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description={
            language === "en"
              ? "You can add vocabulary or expressions by yourself or select from the dictionary"
              : "単語を自分で登録、または辞書から選択して登録することができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description={
            language === "en"
              ? "You can store vocablary in collections you make for different types of vocabulary so you can memorize vocabulary in a more organized way"
              : "単語は自分で作成できるコレクションに単語の種類ごとに保存できるので、より整った環境で覚えることができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description={
            language === "en"
              ? "You can write a journal a day for each collection with a dictionary feature so you can use or learn vocabulary more!"
              : "各コレクションごとに辞書機能を使用して、日々ジャーナルをつづることができるので、もっと単語を使う・学ぶことができます"
          }
        />
      </div>
      <p
        ref={lastRef}
        className={`${transitionClassName} text-lg text-center mt-7 text-red-700 bg-gradient-to-r from-orange-300 to-yellow-300 transform -skew-x-12 p-2 rounded-md shadow-md shadow-black/10 tracking-wider ease-in-out ${
          lastInView ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        {language === "en"
          ? "Let's level up your language skills with us!"
          : "私たちと共に言語のスキルを磨きましょう！"}
      </p>
    </div>
  );
}

function Description({
  inViewOptions,
  transitionClassName,
  imageUrl,
  alt,
  description,
}: {
  inViewOptions: object;
  transitionClassName: string;
  imageUrl: string;
  alt: string;
  description: string;
}) {
  const [ref, inView, entry] = useInView(inViewOptions);

  return (
    <div
      ref={ref}
      className={`${transitionClassName} ease-in-out w-full h-fit mt-11 flex flex-col items-center gap-4 ${
        inView ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* I will remove the div later */}
      {imageUrl && alt ? (
        <Image
          src={imageUrl}
          alt={alt}
          width={500}
          height={300}
          className="w-full h-auto aspect-[1/0.6] object-contain"
        />
      ) : (
        <div className="w-full h-auto aspect-[1/0.6] bg-slate-400"></div>
      )}
      <p className="w-[90%] text-base leading-snug">{description}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full h-fit bg-orange-500 text-xs text-center py-3">
      <div className="w-full h-fit flex flex-row justify-center gap-4 mb-1">
        <Link
          href=""
          className="bg-[url('/icons/github.svg')] w-9 aspect-square bg-center bg-contain"
        ></Link>
        <Link
          href=""
          className="bg-[url('/icons/instagram.svg')] w-9 aspect-square bg-center bg-contain"
        ></Link>
      </div>
      <p>Designed by Freepik</p>
      <p>© 2026 Lei-chan</p>
    </footer>
  );
}
