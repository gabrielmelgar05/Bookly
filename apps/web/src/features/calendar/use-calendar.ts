"use client";

import { useState } from "react";
import { addDays, addMonths, type CalendarPeriod } from "@/lib/calendar";
import { useToday } from "@/hooks/use-today";

export function useCalendar() {
  const today = useToday();
  const [selection, setSelection] = useState<string | null>(null);
  const [period, setPeriod] = useState<CalendarPeriod>("month");
  const selected = selection ?? today;

  function move(direction: number) {
    setSelection(
      period === "month"
        ? addMonths(selected, direction)
        : addDays(selected, direction * (period === "week" ? 7 : 1)),
    );
  }

  return {
    today,
    selected,
    select: setSelection,
    period,
    setPeriod,
    move,
    goToToday: () => setSelection(null),
  };
}
