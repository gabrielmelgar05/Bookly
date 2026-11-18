import { requireUser } from "@/lib/auth-server";
import type { Metadata } from "next";
import { Bell, ShieldCheck, SlidersHorizontal, UserRound } from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimezoneCard } from "@/features/settings/timezone-card";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="OS DETALHES DO SEU ESPAÇO"
        title="Configurações"
        description="Um lugar para deixar o Bookly com o seu jeito."
      />
      <div className="settings-grid">
        <Card className="settings-card">
          <div className="settings-card-title">
            <span className="settings-icon">
              <UserRound size={19} aria-hidden="true" />
            </span>
            <h2>Informações do profissional</h2>
            <Badge>Em breve</Badge>
          </div>
          <p className="settings-card-description">
            Como você se apresenta aos seus clientes.
          </p>
          <dl className="settings-values">
            <div>
              <dt>Nome de exibição</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Área de atuação</dt>
              <dd>Não informada</dd>
            </div>
          </dl>
        </Card>
        <Card className="settings-card">
          <div className="settings-card-title">
            <span className="settings-icon">
              <ShieldCheck size={19} aria-hidden="true" />
            </span>
            <h2>Dados da conta</h2>
            <Badge>Em breve</Badge>
          </div>
          <p className="settings-card-description">
            Informações de acesso, reunidas com segurança.
          </p>
          <dl className="settings-values">
            <div>
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Acesso à conta</dt>
              <dd>Sessão ativa</dd>
            </div>
          </dl>
        </Card>
        <Card className="settings-card">
          <div className="settings-card-title">
            <span className="settings-icon">
              <SlidersHorizontal size={19} aria-hidden="true" />
            </span>
            <h2>Preferências</h2>
            <Badge>Em breve</Badge>
          </div>
          <p className="settings-card-description">
            Pequenos ajustes para uma rotina mais confortável.
          </p>
          <div className="preference-row">
            <Bell size={18} aria-hidden="true" />
            <div>
              <strong>Notificações por e-mail</strong>
              <p>Preferência ainda não configurada.</p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={false}
              aria-label="Notificações por e-mail (em breve)"
              disabled
            >
              <span />
            </button>
          </div>
          <p className="settings-hint">
            As preferências poderão ser editadas futuramente.
          </p>
        </Card>
        <TimezoneCard />
      </div>
      <div className="settings-footer">
        <p>As configurações ainda não podem ser editadas.</p>
        <Button disabled>Salvar alterações</Button>
      </div>
    </div>
  );
}
