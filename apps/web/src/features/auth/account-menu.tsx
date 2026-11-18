"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LoaderCircle, LogOut, UserRound } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api-client";
import type { PublicUser } from "@/types/auth";

export function AccountMenu({ user }: { user: PublicUser }) {
  const router = useRouter();
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await apiRequest<void>("/auth/logout", { method: "POST", body: {} });
      router.replace("/login");
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Não foi possível sair. Tente novamente.",
      );
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <div
      className="account-menu"
      ref={menu}
      onKeyDown={(event) => {
        if (event.key === "Escape" && menu.current) {
          setOpen(false);
          menu.current
            .querySelector<HTMLButtonElement>(".account-trigger")
            ?.focus();
        }
      }}
    >
      <button
        type="button"
        className="account-trigger"
        aria-expanded={open}
        aria-controls="account-options"
        onClick={() => setOpen(!open)}
        aria-label={`Conta de ${user.name}`}
      >
        <span className="account-placeholder">
          <UserRound size={17} aria-hidden="true" />
        </span>
        <span className="account-name">{user.name}</span>
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      <div className="account-popup" id="account-options" hidden={!open}>
        <strong>{user.name}</strong>
        <span>{user.email}</span>
        <button type="button" onClick={logout} disabled={pending}>
          {pending ? (
            <LoaderCircle
              className="animate-spin"
              size={16}
              aria-hidden="true"
            />
          ) : (
            <LogOut size={16} aria-hidden="true" />
          )}
          {pending ? "Saindo…" : "Sair da conta"}
        </button>
        {error && <p role="alert">{error}</p>}
      </div>
    </div>
  );
}
