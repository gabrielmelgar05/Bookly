import {
  CalendarDays,
  CalendarCheck2,
  Clock3,
  LayoutDashboard,
  Layers3,
  Settings2,
} from "lucide-react";

export const navigation = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Agendamentos", icon: CalendarCheck2 },
  { href: "/dashboard/services", label: "Serviços", icon: Layers3 },
  { href: "/dashboard/availability", label: "Disponibilidade", icon: Clock3 },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings2 },
] as const;

export function isActiveRoute(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
