import { requireUser } from "@/lib/auth-server";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  Layers3,
  Sparkles,
} from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { Card, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/features/dashboard/stat-card";
import { TodayLabel } from "@/features/dashboard/today-label";
import { AgendaOverview } from "@/features/calendar/agenda-overview";

export default async function DashboardPage() {
  await requireUser();
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="SEU ESPAÇO DE TRABALHO"
        title="Tudo pronto para começar."
        description="Uma visão mais clara da sua rotina, com espaço para o que importa."
        action={<TodayLabel />}
      />
      <div className="stats-grid">
        <StatCard
          title="Agendamentos hoje"
          description="Seus atendimentos do dia aparecerão aqui."
          icon={CalendarCheck2}
        />
        <StatCard
          title="Próximos atendimentos"
          description="Acompanhe o que vem pela frente."
          icon={Clock3}
        />
        <StatCard
          title="Serviços cadastrados"
          description="Seu catálogo de serviços, em um só lugar."
          icon={Layers3}
        />
      </div>
      <div className="overview-grid">
        <Card>
          <CardHeader
            title="Próximos agendamentos"
            description="Seus próximos encontros, em um só lugar."
            action={<Badge>Sem dados</Badge>}
          />
          <EmptyState
            icon={CalendarDays}
            title="Sua agenda começa por aqui"
            description="Quando houver agendamentos, seus próximos atendimentos aparecerão neste espaço."
            action={
              <ButtonLink
                href="/dashboard/bookings"
                variant="secondary"
                compact
              >
                Explorar agendamentos{" "}
                <ArrowRight size={15} aria-hidden="true" />
              </ButtonLink>
            }
          />
          <div className="card-bottom-link">
            <span>Um espaço para organizar cada encontro.</span>
            <Link href="/dashboard/calendar">
              Ver calendário <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Visão geral da agenda"
            description="Encontre seu próximo dia com tranquilidade."
          />
          <AgendaOverview />
        </Card>
      </div>
      <section className="getting-started">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRIMEIROS PASSOS</span>
            <h2>Prepare seu espaço</h2>
          </div>
          <span className="section-hint">
            <Sparkles size={14} aria-hidden="true" /> Tudo começa com uma boa
            organização.
          </span>
        </div>
        <div className="setup-grid">
          <Link href="/dashboard/services" className="setup-card">
            <span className="setup-icon">
              <Layers3 size={21} aria-hidden="true" />
            </span>
            <div>
              <span className="setup-step">01 · SEUS SERVIÇOS</span>
              <h3>Mostre o que você faz de melhor</h3>
              <p>Conheça o espaço para seus serviços, durações e valores.</p>
              <span className="setup-link">
                Conhecer serviços <ArrowRight size={14} aria-hidden="true" />
              </span>
            </div>
            <ArrowRight size={18} className="setup-arrow" aria-hidden="true" />
          </Link>
          <Link href="/dashboard/availability" className="setup-card">
            <span className="setup-icon">
              <Clock3 size={21} aria-hidden="true" />
            </span>
            <div>
              <span className="setup-step">02 · SUA ROTINA</span>
              <h3>Sua agenda, no seu ritmo</h3>
              <p>
                Explore a organização dos seus dias e horários de atendimento.
              </p>
              <span className="setup-link">
                Ver disponibilidade <ArrowRight size={14} aria-hidden="true" />
              </span>
            </div>
            <ArrowRight size={18} className="setup-arrow" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
