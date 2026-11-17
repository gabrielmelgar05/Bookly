"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { KeyboardEvent } from "react";
import {
  addDays,
  addMonths,
  fullDateLabel,
  monthDates,
  monthLabel,
  weekdays,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export function CalendarPicker({
  selected,
  today,
  onSelect,
  compact = false,
}: {
  selected: string;
  today: string;
  onSelect: (date: string) => void;
  compact?: boolean;
}) {
  function navigateByKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    date: string,
  ) {
    const offsets: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    let next: string;
    if (event.key in offsets) next = addDays(date, offsets[event.key]);
    else if (event.key === "PageUp") next = addMonths(date, -1);
    else if (event.key === "PageDown") next = addMonths(date, 1);
    else return;
    event.preventDefault();
    onSelect(next);
    const container = event.currentTarget.closest(".calendar-picker");
    window.requestAnimationFrame(() =>
      container
        ?.querySelector<HTMLButtonElement>(`[data-calendar-date="${next}"]`)
        ?.focus(),
    );
  }

  return (
    <div
      className={cn(
        "calendar-picker",
        compact ? "calendar-picker-compact" : "calendar-picker-full",
      )}
    >
      {compact && (
        <div className="mini-calendar-heading">
          <span className="month-title">{monthLabel(selected)}</span>
          <div className="flex gap-1">
            <button
              type="button"
              className="icon-button"
              onClick={() => onSelect(addMonths(selected, -1))}
              aria-label="Mês anterior"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onSelect(addMonths(selected, 1))}
              aria-label="Próximo mês"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <div className="calendar-weekdays" aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendar-days" aria-label={monthLabel(selected)}>
        {monthDates(selected).map((date) => (
          <button
            key={date}
            type="button"
            data-calendar-date={date}
            tabIndex={date === selected ? 0 : -1}
            aria-label={fullDateLabel(date)}
            aria-pressed={date === selected}
            aria-current={date === today ? "date" : undefined}
            onKeyDown={(event) => navigateByKeyboard(event, date)}
            onClick={() => onSelect(date)}
            className={cn(
              "calendar-day",
              date.slice(0, 7) !== selected.slice(0, 7) &&
                "calendar-day-outside",
              date === today && "calendar-day-today",
              date === selected && "calendar-day-selected",
            )}
          >
            <span>{Number(date.slice(-2))}</span>
            {!compact && (
              <span className="calendar-day-space" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
