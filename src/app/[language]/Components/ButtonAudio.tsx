"use client";
import { useState } from "react";

export default function ButtonAudio({ src }: { src: string }) {
  const [isAudioPlayed, setIsAudioPlayed] = useState(false);

  function handleToggleAudio() {
    setIsAudioPlayed(!isAudioPlayed);
  }

  return (
    <>
      <button
        className="w-5 aspect-square bg-[url('/icons/audio.svg')] bg-center bg-contain bg-no-repeat"
        onClick={handleToggleAudio}
      ></button>
      {isAudioPlayed && (
        <audio autoPlay src={src} onEnded={handleToggleAudio}></audio>
      )}
    </>
  );
}
