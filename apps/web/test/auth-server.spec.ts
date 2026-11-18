// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, requireUser } from "@/lib/auth-server";
import { safeDestination, validateAuthFields } from "@/lib/auth-validation";
import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("REDIRECT");
  }),
}));
const fetchMock = vi.fn();
const user = {
  id: "test-id",
  name: "Synthetic Professional",
  email: "synthetic@example.test",
};

function cookie(token?: string) {
  vi.mocked(cookies).mockResolvedValue({
    get: () => (token ? { name: "bookly_session", value: token } : undefined),
  } as unknown as Awaited<ReturnType<typeof cookies>>);
}

describe("Proteção no servidor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001/api");
    cookie();
    vi.mocked(headers).mockResolvedValue(
      new Headers({
        "x-bookly-return-to": "/dashboard/calendar?view=week",
      }) as Awaited<ReturnType<typeof headers>>,
    );
  });

  it("nega acesso sem sessão antes de buscar dados privados", async () => {
    await expect(requireUser()).rejects.toThrow("REDIRECT");
    expect(redirect).toHaveBeenCalledWith(
      "/login?next=%2Fdashboard%2Fcalendar%3Fview%3Dweek",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("encaminha somente o cookie necessário e não usa cache de usuário", async () => {
    cookie("a".repeat(43));
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ ...user, passwordHash: "must-not-be-forwarded" }),
      ),
    );
    expect(await getCurrentUser()).toEqual(user);
    const options = fetchMock.mock.calls[0][1];
    expect(options.cache).toBe("no-store");
    expect(options.headers).toEqual({
      Accept: "application/json",
      Cookie: `bookly_session=${"a".repeat(43)}`,
    });
  });

  it("não compartilha respostas entre cookies de usuários diferentes", async () => {
    cookie("a".repeat(43));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(user)));
    expect((await getCurrentUser())?.id).toBe(user.id);
    cookie("b".repeat(43));
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ...user, id: "another-user" })),
    );
    expect((await getCurrentUser())?.id).toBe("another-user");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejeita sessão inexistente ou expirada confirmada pelo backend", async () => {
    cookie("a".repeat(43));
    fetchMock.mockResolvedValue(new Response("{}", { status: 401 }));
    expect(await getCurrentUser()).toBeNull();
  });

  it("não libera acesso quando o backend está indisponível", async () => {
    cookie("a".repeat(43));
    fetchMock.mockResolvedValue(new Response("{}", { status: 503 }));
    await expect(requireUser()).rejects.toThrow("Não foi possível verificar");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("proxy preserva destino interno e não autoriza somente pelo cookie", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/dashboard/calendar?view=week"),
    );
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe(
      "/dashboard/calendar?view=week",
    );
    const present = proxy(
      new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          Cookie: `bookly_session=${"a".repeat(43)}`,
          "x-bookly-return-to": "https://evil.example",
        },
      }),
    );
    expect(present.headers.get("x-middleware-request-x-bookly-return-to")).toBe(
      "/dashboard",
    );
    expect(present.headers.get("cache-control")).toBe("private, no-store");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/login",
    "/dashboard/../login",
    "/dashboard\\evil",
    "/dashboard\nInjected",
  ])("bloqueia retorno externo ou malformado: %s", (value) => {
    expect(safeDestination(value)).toBe("/dashboard");
  });

  it("valida senha longa e confirmação sem exigir padrões arbitrários", () => {
    expect(
      validateAuthFields("register", {
        name: "Test Name",
        email: "test@example.test",
        password: "short",
        confirmation: "other",
      }),
    ).toMatchObject({
      password: expect.any(String),
      confirmation: expect.any(String),
    });
    expect(
      validateAuthFields("register", {
        name: "Test Name",
        email: "test@example.test",
        password: "a long passphrase with spaces",
        confirmation: "a long passphrase with spaces",
      }),
    ).toEqual({});
  });
});
