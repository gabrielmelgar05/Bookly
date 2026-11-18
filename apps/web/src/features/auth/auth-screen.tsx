import Link from "next/link";
import { ArrowLeft, CalendarCheck2, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { ApiStatus } from "@/components/shared/api-status";
import { getCurrentUser } from "@/lib/auth-server";
import { safeDestination, type AuthMode } from "@/lib/auth-validation";
import { redirect } from "next/navigation";
import { AuthForm } from "./auth-form";

export type AuthSearchParams = Promise<{ next?: string | string[] }>;

export async function AuthScreen({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: AuthSearchParams;
}) {
  const params = await searchParams;
  const destination = safeDestination(params.next);
  const user = await getCurrentUser();
  if (user) redirect(destination);
  const register = mode === "register";
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Brand />
        <Link href="/" className="auth-back">
          <ArrowLeft size={15} aria-hidden="true" /> Voltar ao início
        </Link>
      </header>
      <main id="main-content" className="auth-main">
        <aside className="auth-introduction">
          <span className="eyebrow">SEU TEMPO, BEM ORGANIZADO</span>
          <h2>
            Mais espaço para
            <br />o que você faz <span>bem.</span>
          </h2>
          <p>
            Uma rotina com mais clareza começa com um lugar para chamar de seu.
          </p>
          <div className="auth-benefit">
            <span>
              <CalendarCheck2 size={22} aria-hidden="true" />
            </span>
            <div>
              <strong>Seu espaço de organização</strong>
              <p>Serviços, disponibilidade e encontros no mesmo lugar.</p>
            </div>
          </div>
          <div className="auth-benefit">
            <span>
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <strong>Acesso reservado a você</strong>
              <p>Sua conta e suas informações protegidas.</p>
            </div>
          </div>
        </aside>
        <section className="auth-card">
          <span className="eyebrow">
            {register ? "VAMOS COMEÇAR" : "BEM-VINDO DE VOLTA"}
          </span>
          <h1>{register ? "Crie seu espaço." : "Entre no seu espaço."}</h1>
          <p className="auth-description">
            {register
              ? "Conte um pouco sobre você para criar sua conta no Bookly."
              : "Use seu e-mail e sua senha para continuar de onde parou."}
          </p>
          <AuthForm mode={mode} destination={destination} />
        </section>
      </main>
      <footer className="auth-footer">
        <span>Bookly. Seu tempo, bem organizado.</span>
        <ApiStatus />
      </footer>
    </div>
  );
}
