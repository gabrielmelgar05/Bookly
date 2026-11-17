export type CalendarPeriod = "month" | "week" | "day";

export const weekdays = [
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
  "Dom",
] as const;

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(key: string) {
  const date = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid calendar date");
  return date;
}

function utcDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(key: string, amount: number) {
  const date = dateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return utcDateKey(date);
}

export function addMonths(key: string, amount: number) {
  const date = dateFromKey(key);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + amount);
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return utcDateKey(date);
}

export function startOfWeek(key: string) {
  return addDays(key, -((dateFromKey(key).getUTCDay() + 6) % 7));
}

export function monthDates(key: string): string[] {
  const first = `${key.slice(0, 7)}-01`;
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function weekDates(key: string): string[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatDate(
  key: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("pt-BR", {
    ...options,
    timeZone: "UTC",
  }).format(dateFromKey(key));
}

export function monthLabel(key: string) {
  return formatDate(key, { month: "long", year: "numeric" });
}

export function fullDateLabel(key: string) {
  return formatDate(key, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
