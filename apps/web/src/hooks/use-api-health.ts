"use client";

import { useEffect, useState } from "react";
import { isHealthyResponse, type ApiConnection } from "@/types/health";

export function useApiHealth() {
  const [connection, setConnection] = useState<ApiConnection>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    async function check() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL missing");
        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !isHealthyResponse(await response.json())) {
          throw new Error("Health check failed");
        }
        if (active) setConnection("connected");
      } catch {
        if (active) setConnection("error");
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void check();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [attempt]);

  function retry() {
    setConnection("loading");
    setAttempt((value) => value + 1);
  }

  return { connection, retry };
}
