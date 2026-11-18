import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthScreen, type AuthSearchParams } from "@/features/auth/auth-screen";

export const metadata: Metadata = { title: "Criar conta | Bookly" };
export default function RegisterPage({
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
      <AuthScreen mode="register" searchParams={searchParams} />
    </Suspense>
  );
}
