"use client";

import { RefreshCw } from "lucide-react";
import { useApiHealth } from "@/hooks/use-api-health";
import { cn } from "@/lib/utils";

const labels = {
  loading: "Verificando API",
  connected: "API conectada",
  error: "API indisponível",
};
const descriptions = {
  loading: "Consultando a API e o banco de dados.",
  connected: "API e banco de dados conectados.",
  error: "Não foi possível confirmar a conexão com a API e o banco de dados.",
};

export function ApiStatus() {
  const { connection, retry } = useApiHealth();
  return (
    <div className={cn("api-status", `api-status-${connection}`)}>
      <span role="status" aria-live="polite" title={descriptions[connection]}>
        <span className="status-dot" aria-hidden="true" />
        {labels[connection]}
        <span className="sr-only">. {descriptions[connection]}</span>
      </span>
      <button
        type="button"
        className="status-retry"
        onClick={retry}
        disabled={connection === "loading"}
        aria-label="Verificar conexão da API"
        title="Verificar conexão da API"
      >
        <RefreshCw size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
