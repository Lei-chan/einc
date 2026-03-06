"use client";
import { useEffect, useState } from "react";

export default function AccountClosed() {
  const [opacity, setOpacity] = useState("opacity-0");

  useEffect(() => {
    (() => setOpacity("opacity-100"))();
  }, []);

  return (
    <div
      className={`w-screen h-screen flex flex-col items-center justify-center bg-white/90 transition-all duration-[3000ms] ${opacity}`}
    >
      <p className="text-lg text-black/70">
        Thank you for using einc!
        <br />
        We hope to see you again :)
      </p>
    </div>
  );
}
