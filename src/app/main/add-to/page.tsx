"use client";
import FolderPagination from "@/app/Components/FolderPagination";
import { useState } from "react";

export default function AddTo() {
  const msgClassName = "text-white mx-3 mt-5 px-1 rounded text-center";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function displayError(msg: string) {
    setError(msg);
  }

  function displayMessage(msg: string) {
    setMessage(msg);
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="relative w-full h-full flex flex-col items-center">
        {error ? (
          <p className={`${msgClassName} bg-orange-500`}>{error}</p>
        ) : message ? (
          <p className={`${msgClassName} bg-green-400`}>{message}</p>
        ) : (
          <h1 className="text-xl w-[85%] mt-3">
            Which folder do you want to add it to?
          </h1>
        )}
        <FolderPagination
          type="addTo"
          displayError={displayError}
          displayMessage={displayMessage}
        />
      </div>
    </div>
  );
}
