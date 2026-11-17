"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Sparkles, X } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { navigation, isActiveRoute } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="sidebar-content">
      <div className="sidebar-brand">
        <Brand />
        {onNavigate && (
          <button
            className="icon-button"
            onClick={onNavigate}
            aria-label="Fechar menu de navegação"
          >
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="workspace-label">
        <span className="workspace-mark">B</span>
        <div>
          <strong>Meu espaço</strong>
          <span>Ambiente de demonstração</span>
        </div>
      </div>
      <nav aria-label="Navegação principal" className="sidebar-navigation">
        <p className="nav-label">ESPAÇO DE TRABALHO</p>
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
            className={cn(
              "nav-link",
              isActiveRoute(pathname, href) && "nav-link-active",
              href.endsWith("settings") && "nav-link-settings",
            )}
          >
            <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>{label}</span>
            {isActiveRoute(pathname, href) && (
              <span className="nav-active-dot" aria-hidden="true" />
            )}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="demo-note">
          <Sparkles size={17} aria-hidden="true" />
          <strong>Um começo mais simples.</strong>
          <p>Explore seu novo espaço de organização.</p>
          <Link href="/" onClick={onNavigate}>
            Conheça o Bookly <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <span className="sidebar-caption">
          Mais clareza. Mais tempo para você.
        </span>
      </div>
    </div>
  );
}
