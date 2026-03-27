"use client";
// react
import { startTransition, useActionState, useEffect, useState } from "react";
//next.js
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
//components
import Logo from "./Components/LogoOnlineMark";
// methods
import {
  doesPathnameContainLanguage,
  getLanguageFromPathname,
  urlBase64ToUint8Array,
} from "../lib/helper";
// settings
import { GITHUB_LINK, INSTAGRAM_LINK } from "../lib/config/settings";
// type
import { Language } from "../lib/config/types/others";
//libraries
import { useInView } from "react-intersection-observer";
import { subscribeUser, unsubscribeUser } from "../actions/pwa";
import { FormStateSubscription } from "../lib/config/types/formState";

export default function Home() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  return (
    <div className="w-full h-fit flex flex-col items-center overflow-hidden ">
      <Top pathname={pathname} />
      <Middle language={language} />
      <Footer />
      <PWA language={language} />
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
      <Logo showOnlineMark={false} />
      <div className="absolute w-[60%] sm:w-[40%] md:w-[35%] lg:w-[29%] xl:w-[20%] 2xl:w-[16%] h-fit flex flex-row text-[15px] gap-3 xl:gap-5 right-4 xl:right-7 text-red-600 text-center items-center leading-tight justify-end ">
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
  const imageBasePathForLanguage = `/descriptions/${language}/`;

  const inViewOptions = {
    threshold: 0.5,
    triggerOnce: true,
  };

  const [firstRef, firstInView, firstEntry] = useInView(inViewOptions);
  const [lastRef, lastInView, lastEntry] = useInView(inViewOptions);

  return (
    <div className="w-[16rem] sm:w-[25rem] md:w-[27rem] lg:w-[28rem] xl:w-[30rem] h-fit mt-[16vh] py-10 lg:py-14 flex flex-col items-center gap-3 md:gap-4 lg:gap-5">
      <div
        ref={firstRef}
        className={`w-full sm:w-[500px] h-auto aspect-[3/2] flex flex-col items-center ease-in ${transitionClassName} ${
          firstInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <video
          src={`/explanation-${language}.mp4`}
          autoPlay={true}
          controls
          muted
          loop
          className="w-full shadow-lg shadow-black/30 rounded"
        ></video>
        <p className="w-[95%] text-lg bg-gradient-to-r from-white to-white/80 py-2 px-4 shadow-black/20 shadow-lg rounded-md mt-3 sm:mt-5 md:mt-6 lg:mt-7 text-red-700 italic">
          &quot;einc&quot;
          {language === "en"
            ? " will help you memorize vocabulary or expressions more efficiently!"
            : "はより効率的に単語や表現を覚えるのを助けます！"}
        </p>
      </div>
      <div className="w-full mt-11 sm:mt-14 md:mt-16 lg:mt-20 xl:mt-24 flex flex-col gap-11 md:gap-12 lg:gap-14 xl:gap-16 2xl:gap-20">
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageData={[
            {
              src: `${imageBasePathForLanguage}list.png`,
              alt: language === "en" ? "List image" : "リストの画像",
            },
            {
              src: `${imageBasePathForLanguage}flashcard.png`,
              alt: language === "en" ? "Flashcard image" : "暗記帳の画像",
            },
            {
              src: `${imageBasePathForLanguage}quiz.png`,
              alt: language === "en" ? "Quiz image" : "クイズの画像",
            },
          ]}
          description={
            language === "en"
              ? "You can learn vocabulary you registered by lists, frashcards, and quiz"
              : "登録した単語をリスト、暗記帳、クイズの機能を使用して勉強ができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageData={[
            {
              src: `${imageBasePathForLanguage}add.png`,
              alt:
                language === "en"
                  ? "Registering word image"
                  : "単語を登録する画像",
            },
          ]}
          description={
            language === "en"
              ? "You can register vocabulary or expressions by yourself or select from the dictionary"
              : "単語を自分で登録、または辞書から選択して登録することができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageData={[
            {
              src: `${imageBasePathForLanguage}main.png`,
              alt:
                language === "en"
                  ? "Collections in the main page image"
                  : "メインページのコレクションの画像",
            },
            {
              src: `${imageBasePathForLanguage}collection.png`,
              alt:
                language === "en"
                  ? "Collection page image"
                  : "コレクションページの画像",
            },
            {
              src: `${imageBasePathForLanguage}progress.png`,
              alt:
                language === "en"
                  ? "Your progress section image"
                  : "あなたの進捗セクションの画像",
            },
          ]}
          description={
            language === "en"
              ? "You can store and study vocablary by different types of vocabulary in collections you can make so you can memorize vocabulary in a more organized way"
              : "単語は自分で作成できるコレクションに単語の種類ごとに保存し勉強できるので、より整った環境で覚えることができます"
          }
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageData={[
            { src: `${imageBasePathForLanguage}journal.png`, alt: "" },
          ]}
          description={
            language === "en"
              ? "You can write a journal a day for each collection with a dictionary feature so you can use or learn vocabulary more!"
              : "各コレクションごとに辞書機能を使用して、日々ジャーナルをつづることができるので、もっと単語を使う・学ぶことができます"
          }
        />
      </div>
      <p
        ref={lastRef}
        className={`${transitionClassName} text-lg xl:text-xl 2xl:text-2xl text-center mt-5 sm:mt-8 md:mt-9 text-red-700 bg-gradient-to-r from-orange-300 to-yellow-300 transform -skew-x-12 p-2 lg:p-3 xl:p-4 rounded-md shadow-md shadow-black/10 tracking-wider ease-in-out ${
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
  imageData,
  description,
}: {
  inViewOptions: object;
  transitionClassName: string;
  imageData: { src: string; alt: string }[];
  description: string;
}) {
  const [ref, inView, entry] = useInView(inViewOptions);

  const [curImage, setCurImage] = useState(0);

  function handleClickImage(i: number) {
    setCurImage(i);
  }

  return (
    <div
      ref={ref}
      className={`${transitionClassName} ease-in-out w-full h-fit flex flex-col items-center gap-4 ${
        inView ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full h-auto aspect-[1/0.6] flex flex-row items-center">
        {imageData.map((data, i) => (
          <Image
            key={i}
            src={data.src}
            alt={data.alt}
            width={500}
            height={300}
            className={`absolute object-contain w-full h-full shadow-lg rounded transition-all duration-1000 cursor-pointer ${i === curImage ? "shadow-black/30" : "shadow-black/40 grayscale-[0.6]"}`}
            style={{
              transform: `translateX(${(i - curImage) * 95}%) scale(${i === curImage ? "1" : "0.8"})`,
            }}
            onClick={() => handleClickImage(i)}
          />
        ))}
      </div>
      <p className="w-[90%] text-base leading-snug sm:mt-2 md:mt-3 xl:mt-4 2xl:mt-5">
        {description}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="w-full h-fit bg-orange-500 text-xs text-center py-3 lg:py-5 xl:py-6">
      <div className="w-full h-fit flex flex-row justify-center gap-4 lg:gap-5 mb-1 lg:mb-2 xl:mb-3">
        <Link
          href={GITHUB_LINK}
          className="bg-[url('/icons/github.svg')] w-9 aspect-square bg-center bg-contain"
        ></Link>
        <Link
          href={INSTAGRAM_LINK}
          className="bg-[url('/icons/instagram.svg')] w-9 aspect-square bg-center bg-contain"
        ></Link>
      </div>
      <p>Designed by Freepik</p>
      <p className="2xl:mt-1">© 2026 Lei-chan</p>
    </footer>
  );
}

// // PWA related from here
function PWA({ language }: { language: Language }) {
  const [isShown, setIsShown] = useState(true);

  function handleClickClose() {
    setIsShown(false);
  }

  return (
    <div
      className={`fixed w-full h-fit left-0 bottom-0 bg-white shadow-[-10px_-10px_20px_rgba(0,0,0,0.2)] text-center px-3 transition-all duration-500 ${isShown ? "" : "translate-y-full"}`}
    >
      <button
        type="button"
        className="absolute text-2xl right-2"
        onClick={handleClickClose}
      >
        ×
      </button>
      <PushNotificationManager language={language} />
      <InstallPrompt language={language} />
    </div>
  );
}

function PushNotificationManager({ language }: { language: Language }) {
  const btnClassName =
    "text-white transition-all duration-150 rounded px-1 shadow-sm shadow-black/20 text-sm";

  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");

  // I will add error UI later
  const [subscribeState, subscribeAction] = useActionState<
    FormStateSubscription,
    PushSubscription
  >(subscribeUser, undefined);
  const [unsubscribeState, unsubscribeAction] = useActionState<
    FormStateSubscription,
    PushSubscription
  >(unsubscribeUser, undefined);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));

    startTransition(() => subscribeAction(serializedSub));
  }

  async function unsubscribeFromPush() {
    if (!subscription) return;

    await subscription.unsubscribe();
    setSubscription(null);

    startTransition(() =>
      unsubscribeAction(JSON.parse(JSON.stringify(subscription))),
    );
  }

  // later
  // async function sendTestNotification() {
  //   if (subscription) {
  //     await fetch("https://localhost:3000/api/send-notification", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer `,
  //       },
  //       body: JSON.stringify({ title: "Test", body: message, url: "/" }),
  //     });
  //   }
  // }

  useEffect(() => {
    const assignSupportedAndRegisterSW = () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      setIsSupported(true);
      registerServiceWorker();
    };
    assignSupportedAndRegisterSW();
  }, []);

  return (
    <div className="flex flex-col py-4 items-center gap-2">
      {!isSupported ? (
        <p>
          {language === "en"
            ? "Push notifications are not supported in this browser."
            : "プッシュ通知はこのブラウザーではサポートされていません"}
        </p>
      ) : (
        <>
          <h3 className="font-semibold">
            {language === "en" ? "Push Notifications" : "プッシュ通知"}
          </h3>
          {subscription ? (
            <>
              <p>
                {language === "en"
                  ? "You are subscribed to push notifications."
                  : "プッシュ通知はオンになっています"}
              </p>
              <button
                className={`${btnClassName} bg-green-400 hover:bg-green-300`}
                onClick={unsubscribeFromPush}
              >
                {language === "en" ? "Unsubscribe" : "オフにする"}
              </button>
              <input
                type="text"
                placeholder={
                  language === "en"
                    ? "Enter notification message"
                    : "通知文を入力してください"
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {/* <button
                className="bg-green-400 rounded px-1 text-white"
                onClick={sendTestNotification}
              >
                {language === "en" ? "Send Test" : "テストする"}
              </button> */}
            </>
          ) : (
            <>
              <p>
                {language === "en"
                  ? "You are not subscribed to push notifications."
                  : "プッシュ通知はオフになっています"}
              </p>
              <button
                className={`${btnClassName} bg-orange-500 hover:bg-orange-400`}
                onClick={subscribeToPush}
              >
                {language === "en" ? "Subscribe" : "オンにする"}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function InstallPrompt({ language }: { language: Language }) {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  }

  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  async function handleClickInstall() {
    try {
      if (!deferredPrompt) return;

      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } catch (err) {
      console.error("Error", err);
    }
  }

  useEffect(() => {
    const assignIOSAndStandalone = () => {
      setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          !(window as { MSStream?: unknown }).MSStream,
      );

      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    };

    const installEventHandler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    assignIOSAndStandalone();

    window.addEventListener("beforeinstallprompt", installEventHandler);
    return () =>
      window.removeEventListener("beforeinstallprompt", installEventHandler);
  }, []);

  if (isStandalone || !deferredPrompt) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="flex flex-col pt-4 pb-5 gap-2 items-center">
      <h3 className="font-semibold">
        {language === "en" ? "Install App" : "アプリをインストールする"}
      </h3>
      {!isIOS ? (
        <button
          type="button"
          className="bg-purple-500 hover:bg-purple-400 transition-all duration-150 rounded text-white px-1 shadow-black/20 shadow-md"
          onClick={handleClickInstall}
        >
          {language === "en" ? "Add to Home Screen" : "ホームスクリーンに追加"}
        </button>
      ) : (
        <p>
          {language === "en"
            ? 'To install this app on your iOS device, tap the share button and then "Add to Home Screen"'
            : "このアプリをiOSデバイスにインストールする場合は、下のシェアボタンを押し、”ホームスクリーンに追加”を押してください"}
        </p>
      )}
    </div>
  );
}
