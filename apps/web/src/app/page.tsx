"use client";

import { useEffect, useState } from "react";
import { BookOpen, CircleCheck, CircleX, LoaderCircle } from "lucide-react";

type ConnectionState = "loading" | "connected" | "error";

export default function Home() {
  const [connection, setConnection] = useState<ConnectionState>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    async function checkHealth() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) throw new Error("API URL missing");

        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Health check failed");

        const health: unknown = await response.json();
        if (
          typeof health !== "object" ||
          health === null ||
          !("status" in health) ||
          health.status !== "ok" ||
          !("service" in health) ||
          health.service !== "bookly-api" ||
          !("database" in health) ||
          health.database !== "connected"
        ) {
          throw new Error("Invalid health response");
        }

        if (active) setConnection("connected");
      } catch {
        if (active) setConnection("error");
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void checkHealth();
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <BookOpen className="mb-5 size-8 text-emerald-700" aria-hidden="true" />
        <h1 className="text-3xl font-semibold tracking-tight">Bookly</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Ambiente de desenvolvimento. Verificação da conexão entre frontend,
          API e banco de dados.
        </p>
        <div
          role="status"
          aria-live="polite"
          className="mt-6 flex items-start gap-3 rounded-lg bg-zinc-50 p-4 text-sm leading-6"
        >
          {connection === "loading" && (
            <>
              <LoaderCircle
                className="mt-0.5 size-5 shrink-0 animate-spin text-zinc-500"
                aria-hidden="true"
              />
              <p>Verificando conexão…</p>
            </>
          )}
          {connection === "connected" && (
            <>
              <CircleCheck
                className="mt-0.5 size-5 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <p>API e banco de dados conectados.</p>
            </>
          )}
          {connection === "error" && (
            <>
              <CircleX
                className="mt-0.5 size-5 shrink-0 text-red-700"
                aria-hidden="true"
              />
              <p>
                Não foi possível confirmar a conexão. Verifique se a API e o
                banco estão em execução e recarregue a página.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
