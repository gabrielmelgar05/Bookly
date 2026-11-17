"use client";

import { CalendarDays } from "lucide-react";
import { CalendarPicker } from "./calendar-picker";
import { useCalendar } from "./use-calendar";
import { formatDate } from "@/lib/calendar";

export function AgendaOverview() {
  const { today, selected, select } = useCalendar();
  if (!today)
    return (
      <div className="calendar-placeholder" role="status">
        <CalendarDays size={24} aria-hidden="true" />
        <span>Preparando calendário…</span>
      </div>
    );
  return (
    <div className="agenda-overview">
      <CalendarPicker
        compact
        today={today}
        selected={selected}
        onSelect={select}
      />
      <div className="mini-calendar-selection" aria-live="polite">
        <span className="selection-line" />
        <div>
          <strong>
            {formatDate(selected, { day: "numeric", month: "long" })}
          </strong>
          <p>Nenhum atendimento nesta data.</p>
        </div>
      </div>
    </div>
  );
}
