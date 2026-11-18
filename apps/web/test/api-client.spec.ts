// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError } from "@/lib/api-client";

describe("Cliente HTTP", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001/api");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("envia JSON e cookies sem cache", async () => {
    fetchMock.mockResolvedValue(new Response('{"id":"test"}'));
    await expect(
      apiRequest("/auth/login", {
        method: "POST",
        body: { email: "test@example.test" },
      }),
    ).resolves.toEqual({ id: "test" });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
  });

  it.each([400, 401, 403, 409, 429, 500, 503])(
    "trata HTTP %s sem expor a resposta interna",
    async (status) => {
      fetchMock.mockResolvedValue(
        new Response('{"internal":"private"}', { status }),
      );
      const error = await apiRequest("/auth/login").catch(
        (value: unknown) => value,
      );
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(status);
      expect((error as ApiError).message).not.toContain("private");
    },
  );

  it("aceita logout sem corpo de resposta", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(
      apiRequest("/auth/logout", { method: "POST", body: {} }),
    ).resolves.toBeUndefined();
  });

  it("trata falha de rede", async () => {
    fetchMock.mockRejectedValue(new TypeError("network"));
    await expect(apiRequest("/auth/me")).rejects.toThrow(
      "Não foi possível conectar",
    );
  });

  it("cancela uma conexão que excede o timeout", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        }),
    );
    const assertion = expect(
      apiRequest("/auth/me", { timeout: 20 }),
    ).rejects.toThrow("demorou mais");
    await vi.advanceTimersByTimeAsync(21);
    await assertion;
  });
});
