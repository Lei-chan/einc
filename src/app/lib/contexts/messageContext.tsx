"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { DisplayMessage, MessageType } from "../config/types/others";
import PMessage from "@/app/[language]/Components/PMessage";

type TypeMessageContext = {
  showMessage: (
    type: MessageType,
    message: string,
    durationSec?: number,
  ) => void;
};

const MessageContext = createContext<TypeMessageContext | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messageData, setMessageData] = useState<DisplayMessage>(undefined);

  const showMessage = useCallback(
    (type: MessageType, message: string, durationSec: number = 3) => {
      setMessageData({ type, message });
      setTimeout(() => setMessageData(undefined), durationSec * 1000);
    },
    [],
  );

  return (
    <MessageContext.Provider value={{ showMessage }}>
      {messageData && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <PMessage type={messageData.type} message={messageData.message} />
        </div>
      )}
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessage must be used inside MessageProvider");
  return ctx;
}
