import { requireUser } from "@/lib/auth-server";
import type { Metadata } from "next";
import { Clock3, Info, Plus } from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Disponibilidade" };
const days = [
  { short: "SEG", name: "Segunda-feira" },
  { short: "TER", name: "Terça-feira" },
  { short: "QUA", name: "Quarta-feira" },
  { short: "QUI", name: "Quinta-feira" },
  { short: "SEX", name: "Sexta-feira" },
  { short: "SÁB", name: "Sábado" },
  { short: "DOM", name: "Domingo" },
];

export default async function AvailabilityPage() {
  await requireUser();
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="UMA ROTINA QUE FAZ SENTIDO"
        title="Disponibilidade"
        description="Seu tempo de trabalho, organizado do seu jeito."
      />
      <div className="availability-grid">
        <Card>
          <CardHeader
            title="Horários da semana"
            description="Defina, futuramente, os dias e períodos em que deseja atender."
            action={<Badge>Não configurados</Badge>}
          />
          <div className="availability-days">
            {days.map(({ short, name }) => (
              <div className="availability-day" key={short}>
                <span className="weekday-stamp">{short}</span>
                <div className="weekday-description">
                  <h3>{name}</h3>
                  <p>Não configurado</p>
                </div>
                <button
                  className="switch"
                  role="switch"
                  aria-checked={false}
                  aria-label={`Ativar ${name.toLowerCase()} (em breve)`}
                  disabled
                >
                  <span />
                </button>
                <button
                  className="icon-button add-time"
                  disabled
                  aria-label={`Adicionar horário em ${name.toLowerCase()} (em breve)`}
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </Card>
        <div className="availability-explanation">
          <Card className="explanation-card">
            <span className="explanation-icon">
              <Clock3 size={25} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <Badge variant="brand">No seu ritmo</Badge>
            <h2>Uma agenda que respeita seu tempo.</h2>
            <p>
              O primeiro passo para uma rotina mais leve é saber quando você
              quer estar disponível.
            </p>
            <div className="explanation-divider" />
            <div className="quiet-note">
              <Info size={17} aria-hidden="true" />
              <p>
                A configuração de horários e intervalos estará disponível em
                breve. Nenhum período de atendimento foi definido.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
