"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function IsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsOnline(navigator.onLine);
      // try {
      //   const res = await fetch("/api/ping?ts=" + Date.now(), {
      //     cache: "no-store",
      //   });
      //   setIsOnline(res.ok);
      // } catch {
      //   setIsOnline(false);
      // }
    };
    checkConnection();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
