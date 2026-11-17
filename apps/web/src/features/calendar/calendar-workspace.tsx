"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { CalendarPicker } from "./calendar-picker";
import { useCalendar } from "./use-calendar";
import {
  formatDate,
  fullDateLabel,
  monthLabel,
  weekDates,
  type CalendarPeriod,
} from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const periods: { value: CalendarPeriod; label: string }[] = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "day", label: "Dia" },
];

export function CalendarWorkspace() {
  const { today, selected, select, period, setPeriod, move, goToToday } =
    useCalendar();
  if (!today)
    return (
      <Card>
        <div className="calendar-placeholder" role="status">
          <CalendarDays size={24} aria-hidden="true" />
          <span>Preparando calendário…</span>
        </div>
      </Card>
    );
  const week = weekDates(selected);
  const label =
    period === "day"
      ? formatDate(selected, { day: "numeric", month: "long", year: "numeric" })
      : period === "week"
        ? `${formatDate(week[0], { day: "numeric", month: "short" })} – ${formatDate(week[6], { day: "numeric", month: "short", year: "numeric" })}`
        : monthLabel(selected);

  return (
    <div className="calendar-workspace">
      <Card className="calendar-main-card">
        <div className="calendar-toolbar">
          <div className="calendar-period-navigation">
            <div className="flex gap-1">
              <button
                className="icon-button"
                aria-label="Período anterior"
                onClick={() => move(-1)}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                className="icon-button"
                aria-label="Próximo período"
                onClick={() => move(1)}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
            <h2 className="month-title" aria-live="polite">
              {label}
            </h2>
            <Button variant="secondary" compact onClick={goToToday}>
              Hoje
            </Button>
          </div>
          <div
            className="segmented-control"
            role="group"
            aria-label="Período do calendário"
          >
            {periods.map(({ value, label }) => (
              <button
                key={value}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {period === "month" && (
          <CalendarPicker today={today} selected={selected} onSelect={select} />
        )}
        {period === "week" && (
          <div className="week-view">
            {week.map((date) => (
              <button
                key={date}
                onClick={() => select(date)}
                className={cn(
                  "week-day",
                  date === selected && "week-day-selected",
                )}
                aria-label={fullDateLabel(date)}
                aria-pressed={date === selected}
              >
                <span>{formatDate(date, { weekday: "short" })}</span>
                <strong
                  className={date === today ? "week-day-today" : undefined}
                >
                  {Number(date.slice(-2))}
                </strong>
                <span className="week-empty-marker" aria-hidden="true">
                  —
                </span>
                <span className="sr-only">Nenhum atendimento</span>
              </button>
            ))}
          </div>
        )}
        {period === "day" && (
          <div className="day-view">
            <div className="day-hours" aria-hidden="true">
              {[8, 10, 12, 14, 16, 18].map((hour) => (
                <span key={hour}>{String(hour).padStart(2, "0")}:00</span>
              ))}
            </div>
            <div className="day-empty">
              <EmptyState
                compact
                icon={CalendarDays}
                title="Seu dia está livre"
                description="Nenhum atendimento para a data selecionada."
              />
            </div>
          </div>
        )}
        <div className="calendar-legend">
          <span>
            <i className="legend-today" />
            Hoje
          </span>
          <span>
            <i className="legend-selected" />
            Selecionado
          </span>
          <span className="calendar-legend-note">
            Nenhum agendamento cadastrado
          </span>
        </div>
      </Card>
      <div className="calendar-details">
        <Card>
          <CardHeader
            title="Agenda do dia"
            action={
              <CalendarDays
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
            }
          />
          <p className="selected-date-label" aria-live="polite">
            {formatDate(selected, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <EmptyState
            compact
            icon={Clock3}
            title="Nenhum atendimento"
            description="Os agendamentos desta data aparecerão aqui."
          />
        </Card>
        <div className="quiet-note">
          <Clock3 size={17} aria-hidden="true" />
          <p>
            As datas seguem o fuso horário do seu navegador. A configuração de
            horários estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
