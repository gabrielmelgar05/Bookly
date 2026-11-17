import type { Metadata } from "next";
import {
  CalendarCheck2,
  ChevronDown,
  ListFilter,
  Plus,
  Search,
} from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { ResourceList } from "@/components/shared/resource-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Agendamentos" };

export default function BookingsPage() {
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="CADA ENCONTRO IMPORTA"
        title="Agendamentos"
        description="O lugar para acompanhar e organizar seus atendimentos."
        action={
          <Button disabled title="Criação de agendamentos disponível em breve">
            <Plus size={17} aria-hidden="true" /> Novo agendamento
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Todos os agendamentos"
          description="A listagem será preenchida quando houver atendimentos."
          action={<Badge>Em breve</Badge>}
        />
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              aria-label="Buscar agendamentos (em breve)"
              placeholder="Buscar por cliente ou serviço"
              disabled
            />
          </label>
          <Button variant="secondary" compact disabled>
            <ListFilter size={15} aria-hidden="true" /> Filtros{" "}
            <ChevronDown size={13} aria-hidden="true" />
          </Button>
          <span className="toolbar-caption">Busca e filtros em breve</span>
        </div>
        <ResourceList
          label="Lista de agendamentos"
          columns={["Cliente", "Serviço", "Data e horário", "Status"]}
        >
          <EmptyState
            icon={CalendarCheck2}
            title="Espaço para novos encontros"
            description="Você ainda não tem agendamentos para visualizar. A criação e o gerenciamento de reservas estarão disponíveis em breve."
          />
        </ResourceList>
      </Card>
      <p className="page-footnote">
        Nenhum agendamento é criado ou alterado neste ambiente de demonstração.
      </p>
    </div>
  );
}
