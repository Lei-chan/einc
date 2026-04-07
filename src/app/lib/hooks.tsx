"use client";

import { useEffect, useState } from "react";

export function IsOnline() {
  const checkConnectivitySecond = 5;
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const setConnectivity = async () => {
      // const isConnected = await checkConnectivity();

      setIsOnline(navigator.onLine);
    };
    setConnectivity();

    // check internet connectivity every 5 seconds
    const intervalId = setInterval(
      setConnectivity,
      checkConnectivitySecond * 1000,
    );

    return () => clearInterval(intervalId);

    // const handleOnline = () => setIsOnline(true);
    // const handleOffline = () => setIsOnline(false);

    // window.addEventListener("online", handleOnline);
    // window.addEventListener("offline", handleOffline);

    // return () => {
    //   window.removeEventListener("online", handleOnline);
    //   window.removeEventListener("offline", handleOffline);
    // };
  }, []);

  return isOnline;
}
