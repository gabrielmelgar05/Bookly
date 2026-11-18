"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { isHealthyResponse, type ApiConnection } from "@/types/health";

export function useApiHealth() {
  const [connection, setConnection] = useState<ApiConnection>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function check() {
      try {
        const value = await apiRequest<unknown>("/health", {
          signal: controller.signal,
        });
        if (!isHealthyResponse(value)) throw new Error("Health check failed");
        if (active) setConnection("connected");
      } catch {
        if (active) setConnection("error");
      }
    }

    void check();
    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setConnection("loading");
    setAttempt((value) => value + 1);
  }

  return { connection, retry };
}
