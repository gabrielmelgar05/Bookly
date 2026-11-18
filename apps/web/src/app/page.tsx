import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  Layers3,
} from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { ApiStatus } from "@/components/shared/api-status";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgendaOverview } from "@/features/calendar/agenda-overview";

export default function Home() {
  return (
    <div className="landing-page">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header className="landing-header">
        <Brand />
        <div className="landing-navigation">
          <Link href="/login" className="landing-text-link">
            Entrar
          </Link>
          <ButtonLink href="/register" variant="secondary" compact>
            Criar conta <ArrowUpRight size={15} aria-hidden="true" />
          </ButtonLink>
        </div>
      </header>
      <main id="main-content" className="landing-main" tabIndex={-1}>
        <div className="landing-copy">
          <div className="landing-kicker">
            <span /> AGENDAMENTO, COM SIMPLICIDADE
          </div>
          <h1>
            Seu tempo merece
            <br />
            uma agenda <span>melhor.</span>
          </h1>
          <p className="landing-description">
            Um lugar para organizar seus serviços, planejar sua disponibilidade
            e acompanhar cada agendamento. Com mais clareza, do seu jeito.
          </p>
          <ButtonLink href="/register" className="landing-cta">
            Criar minha conta <ArrowRight size={18} aria-hidden="true" />
          </ButtonLink>
          <p className="landing-reassurance">
            <Check size={15} aria-hidden="true" /> Explore o painel. Nenhum
            cadastro necessário.
          </p>
        </div>
        <section
          className="landing-preview"
          aria-label="Demonstração visual do calendário"
        >
          <div className="preview-topbar">
            <div>
              <span className="preview-icon">
                <CalendarDays size={19} aria-hidden="true" />
              </span>
              <span>
                <strong>Sua agenda</strong>
                <small>Um dia de cada vez.</small>
              </span>
            </div>
            <Badge variant="brand">Demonstração</Badge>
          </div>
          <AgendaOverview />
          <div className="preview-note">
            <Clock3 size={16} aria-hidden="true" />
            <span>Mais organização. Mais espaço para você.</span>
          </div>
          <span className="preview-decoration" aria-hidden="true" />
        </section>
        <div className="landing-principles">
          <div>
            <Layers3 size={21} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong>Seus serviços, com clareza</strong>
              <small>Um espaço para o que você oferece.</small>
            </span>
          </div>
          <div>
            <Clock3 size={21} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong>Uma rotina no seu ritmo</strong>
              <small>Seu tempo merece ser respeitado.</small>
            </span>
          </div>
          <div>
            <CalendarDays size={21} strokeWidth={1.5} aria-hidden="true" />
            <span>
              <strong>Cada encontro, no lugar certo</strong>
              <small>Uma visão mais simples da sua agenda.</small>
            </span>
          </div>
        </div>
      </main>
      <footer className="landing-footer">
        <p>
          Bookly<span className="brand-period">.</span>{" "}
          <span>Seu tempo, bem organizado.</span>
        </p>
        <ApiStatus />
      </footer>
    </div>
  );
}
