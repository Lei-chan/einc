"use client";
//next.js
import Image from "next/image";
import Link from "next/link";
//components
import Logo from "./Components/Logo";
//libraries
import { useInView } from "react-intersection-observer";

export default function Home() {
  return (
    <div className="w-screen h-fit flex flex-col items-center">
      <Top />
      <Middle />
      <Footer />
    </div>
  );
}

function Top() {
  return (
    <div className="fixed w-full h-[14vh] left-0 top-0 bg-gradient-to-r from-yellow-200 to-orange-300 flex flex-row items-center shadow-md shadow-black/10 z-10">
      <Logo />
      <div className="absolute w-[60%] h-fit flex flex-row text-base gap-3 right-4 text-red-600 text-center items-center leading-tight justify-end">
        <button
          type="button"
          className="bg-[url('/icons/language.svg')] w-[15%] aspect-square bg-center bg-contain bg-no-repeat"
        ></button>
        <Link href="/login">Login</Link>
        <Link href="/sign-up">Sign-up</Link>
      </div>
    </div>
  );
}

function Middle() {
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
          &quot;einc&quot; will help you memorize vocabulary or expressions more
          efficiently!
        </p>
      </div>
      <div className="w-[90%] py-3">
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description="You can check vocabulary you registered by lists or frash card, and quiz"
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description="You can add vocabulary or expressions by yourself and select from the dictionary"
        />
        <Description
          inViewOptions={inViewOptions}
          transitionClassName={transitionClassName}
          imageUrl=""
          alt=""
          description="You can make separete folders so you can memorize different types of vocabulary in a more organized way"
        />
      </div>
      <p
        ref={lastRef}
        className={`${transitionClassName} text-lg text-center mt-7 text-red-700 bg-gradient-to-r from-orange-300 to-yellow-300 transform -skew-x-12 p-2 rounded-md shadow-md shadow-black/10 tracking-wider ease-in-out ${
          lastInView ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        Let&apos;s level up your language skills with us!
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
