"use client";

import { Globe2 } from "lucide-react";
import { useBrowserTimezone } from "@/hooks/use-today";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TimezoneCard() {
  const timezone = useBrowserTimezone();
  return (
    <Card className="settings-card">
      <div className="settings-card-title">
        <span className="settings-icon">
          <Globe2 size={19} aria-hidden="true" />
        </span>
        <h2>Fuso horário</h2>
        <Badge>Em breve</Badge>
      </div>
      <p className="settings-card-description">
        Mais precisão para cada horário da sua agenda.
      </p>
      <dl className="settings-values">
        <div>
          <dt>Fuso do espaço de trabalho</dt>
          <dd>Não configurado</dd>
        </div>
        <div>
          <dt>Detectado neste navegador</dt>
          <dd className="timezone-value">{timezone || "Verificando…"}</dd>
        </div>
      </dl>
      <p className="settings-hint">
        A seleção do fuso estará disponível em breve.
      </p>
    </Card>
  );
}
