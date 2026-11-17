"use client";

import { useSyncExternalStore } from "react";
import { localDateKey } from "@/lib/calendar";

function subscribe(callback: () => void) {
  const timer = window.setInterval(callback, 60000);
  window.addEventListener("focus", callback);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", callback);
  };
}

const serverSnapshot = () => "";
const todaySnapshot = () => localDateKey();
const timezoneSnapshot = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function useToday() {
  return useSyncExternalStore(subscribe, todaySnapshot, serverSnapshot);
}

export function useBrowserTimezone() {
  return useSyncExternalStore(subscribe, timezoneSnapshot, serverSnapshot);
}
