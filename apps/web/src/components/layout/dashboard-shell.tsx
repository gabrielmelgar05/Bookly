"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, UserRound } from "lucide-react";
import { ApiStatus } from "@/components/shared/api-status";
import { navigation, isActiveRoute } from "@/lib/navigation";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = navigation.find(({ href }) => isActiveRoute(pathname, href));
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function closeNavigation() {
    dialog.current?.close();
    setOpen(false);
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const elements = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex="0"]',
      ),
    ].filter((element) => element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const query = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (query.matches) dialog.current?.close();
    };
    query.addEventListener("change", closeOnDesktop);
    closeOnDesktop();
    return () => {
      document.body.style.overflow = previous;
      query.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="desktop-sidebar">
        <Sidebar />
      </aside>
      <dialog
        id="mobile-navigation"
        ref={dialog}
        className="mobile-navigation"
        aria-labelledby="mobile-navigation-title"
        onClose={() => setOpen(dialog.current?.open === true)}
        onKeyDown={containFocus}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeNavigation();
        }}
      >
        <h2 id="mobile-navigation-title" className="sr-only">
          Navegação do Bookly
        </h2>
        <Sidebar onNavigate={closeNavigation} />
      </dialog>
      <div className="dashboard-body">
        <header className="dashboard-header">
          <div className="header-location">
            <button
              type="button"
              className="icon-button mobile-menu-trigger"
              aria-label="Abrir menu de navegação"
              aria-controls="mobile-navigation"
              aria-expanded={open}
              onClick={() => {
                dialog.current?.showModal();
                setOpen(true);
              }}
            >
              <Menu size={21} aria-hidden="true" />
            </button>
            <span className="header-location-parent">Seu espaço</span>
            <ChevronRight
              size={14}
              className="header-location-chevron"
              aria-hidden="true"
            />
            <span className="header-location-current">
              {page?.label ?? "Bookly"}
            </span>
          </div>
          <div className="header-actions">
            <ApiStatus />
            <span className="header-divider" />
            <span
              className="account-placeholder"
              title="Menu da conta disponível em breve"
            >
              <UserRound size={17} aria-hidden="true" />
              <span className="sr-only">Menu da conta disponível em breve</span>
            </span>
          </div>
        </header>
        <main id="main-content" className="dashboard-main" tabIndex={-1}>
          {children}
        </main>
        <footer className="dashboard-footer">
          <span>
            Bookly<span className="brand-period">.</span>
          </span>
          <span>Seu tempo, bem organizado.</span>
        </footer>
      </div>
    </div>
  );
}
