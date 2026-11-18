import { requireUser } from "@/lib/auth-server";
import type { Metadata } from "next";
import { Clock3, Layers3, Plus, Tag, TextAlignStart } from "lucide-react";
import { PageHeading } from "@/components/shared/page-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { ResourceList } from "@/components/shared/resource-list";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicesPage() {
  await requireUser();
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="O QUE VOCÊ FAZ DE MELHOR"
        title="Seus serviços"
        description="Um espaço para apresentar cada serviço com clareza."
        action={
          <Button disabled title="Cadastro de serviços disponível em breve">
            <Plus size={17} aria-hidden="true" /> Cadastrar serviço
          </Button>
        }
      />
      <Card>
        <CardHeader
          title="Catálogo de serviços"
          description="Organize o que você oferece aos seus clientes."
          action={<Badge>Em breve</Badge>}
        />
        <ResourceList
          label="Lista de serviços"
          columns={["Serviço", "Duração", "Valor", "Status"]}
        >
          <EmptyState
            icon={Layers3}
            title="Dê forma ao que você oferece"
            description="Seu catálogo começa aqui. Em breve, você poderá cadastrar serviços e definir os detalhes de cada atendimento."
          />
        </ResourceList>
      </Card>
      <section className="service-details-strip">
        <div>
          <TextAlignStart size={19} aria-hidden="true" />
          <span>
            <strong>Nome e descrição</strong>
            <small>Apresente cada serviço.</small>
          </span>
        </div>
        <div>
          <Clock3 size={19} aria-hidden="true" />
          <span>
            <strong>Duração do atendimento</strong>
            <small>Reserve o tempo necessário.</small>
          </span>
        </div>
        <div>
          <Tag size={19} aria-hidden="true" />
          <span>
            <strong>Valores organizados</strong>
            <small>Mais clareza para seus clientes.</small>
          </span>
        </div>
      </section>
    </div>
  );
}
