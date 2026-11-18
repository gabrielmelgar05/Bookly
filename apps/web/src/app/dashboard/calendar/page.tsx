import { requireUser } from "@/lib/auth-server";
import type { Metadata } from "next";
import { PageHeading } from "@/components/shared/page-heading";
import { CalendarWorkspace } from "@/features/calendar/calendar-workspace";

export const metadata: Metadata = { title: "Calendário" };

export default async function CalendarPage() {
  await requireUser();
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="SUA ROTINA"
        title="Calendário"
        description="Um pouco mais de clareza para cada dia da sua semana."
      />
      <CalendarWorkspace />
    </div>
  );
}
