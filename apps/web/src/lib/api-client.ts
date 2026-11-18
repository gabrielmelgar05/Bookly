type ApiOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  timeout?: number;
};

const messages: Record<number, string> = {
  400: "Revise os campos informados.",
  401: "E-mail ou senha incorretos.",
  403: "Não foi possível autorizar a solicitação. Atualize a página e tente novamente.",
  409: "Já existe uma conta com este e-mail.",
  429: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base)
    throw new ApiError(
      0,
      "O serviço está indisponível. Tente novamente em instantes.",
    );
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, options.timeout ?? 10000);
  try {
    const response = await fetch(apiUrl(path), {
      method: options.method ?? "GET",
      cache: "no-store",
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
    });
    if (!response.ok)
      throw new ApiError(
        response.status,
        messages[response.status] ??
          "O serviço está indisponível. Tente novamente em instantes.",
      );
    return response.status === 204
      ? (undefined as T)
      : ((await response.json()) as T);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      0,
      controller.signal.aborted
        ? "A conexão demorou mais que o esperado. Tente novamente."
        : "Não foi possível conectar. Verifique sua conexão e tente novamente.",
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
