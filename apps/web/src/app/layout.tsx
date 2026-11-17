import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookly — Seu tempo, bem organizado",
  description:
    "Um espaço para organizar seus serviços, planejar sua disponibilidade e acompanhar cada agendamento. Explore o painel de demonstração do Bookly.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
