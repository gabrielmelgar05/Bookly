"use client";

import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="session-error">
      <ShieldAlert size={32} aria-hidden="true" />
      <h1>Não foi possível confirmar seu acesso.</h1>
      <p>Verifique a conexão com o serviço e tente novamente.</p>
      <div>
        <Button onClick={reset}>Tentar novamente</Button>
        <ButtonLink href="/login" variant="secondary">
          Voltar ao login
        </ButtonLink>
      </div>
    </main>
  );
}
