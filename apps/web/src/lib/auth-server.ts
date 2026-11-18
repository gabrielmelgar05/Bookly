import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { apiUrl } from "./api-client";
import { safeDestination } from "./auth-validation";
import { isPublicUser, SESSION_COOKIE } from "@/types/auth";

// React.cache deduplicates only within this render/request; fetch is never cached.
export const getCurrentUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const response = await fetch(apiUrl("/auth/me"), {
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: "application/json",
      Cookie: `${SESSION_COOKIE}=${token}`,
    },
  });
  if (response.status === 401) return null;
  if (!response.ok)
    throw new Error(
      "Não foi possível verificar sua sessão. Tente novamente em instantes.",
    );
  const user: unknown = await response.json();
  if (!isPublicUser(user))
    throw new Error("Não foi possível verificar sua sessão.");
  return { id: user.id, name: user.name, email: user.email };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const destination = safeDestination(
      (await headers()).get("x-bookly-return-to"),
    );
    redirect(`/login?next=${encodeURIComponent(destination)}`);
  }
  return user;
}
