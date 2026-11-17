"use client";

import { CalendarDays } from "lucide-react";
import { useToday } from "@/hooks/use-today";
import { formatDate } from "@/lib/calendar";

export function TodayLabel() {
  const today = useToday();
  return (
    <span className="today-label">
      <CalendarDays size={16} aria-hidden="true" />
      {today
        ? formatDate(today, { day: "numeric", month: "long", year: "numeric" })
        : "Seu dia, organizado"}
    </span>
  );
}
