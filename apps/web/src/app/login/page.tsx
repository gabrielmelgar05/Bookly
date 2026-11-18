import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen, type AuthSearchParams } from "@/features/auth/auth-screen";

export const metadata: Metadata = { title: "Entrar | Bookly" };
export default function LoginPage({
  searchParams,
}: {
  searchParams: AuthSearchParams;
}) {
  return (
    <Suspense
      fallback={
        <p className="auth-loading" role="status">
          Preparando seu acesso…
        </p>
      }
    >
      <AuthScreen mode="login" searchParams={searchParams} />
    </Suspense>
  );
}
