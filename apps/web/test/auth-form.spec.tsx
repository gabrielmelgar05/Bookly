import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { AuthForm } from "@/features/auth/auth-form";
import { AccountMenu } from "@/features/auth/account-menu";
import { apiRequest, ApiError } from "@/lib/api-client";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/api-client", async (original) => ({
  ...(await original<typeof import("@/lib/api-client")>()),
  apiRequest: vi.fn(),
}));

const user = {
  id: "synthetic-id",
  name: "Synthetic Professional",
  email: "synthetic@example.test",
};
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label, { exact: true }), {
    target: { value },
  });
}
function credentials() {
  fill("E-mail", "synthetic@example.test");
  fill("Senha", "synthetic password for tests");
}

describe("Formulários e sessão", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(cleanup);

  it("renderiza campos, autocompletes e links de login", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("E-mail").getAttribute("autocomplete")).toBe(
      "email",
    );
    expect(screen.getByLabelText("Senha").getAttribute("autocomplete")).toBe(
      "current-password",
    );
    expect(
      screen.getByRole("link", { name: "Criar conta" }).getAttribute("href"),
    ).toBe("/register?next=%2Fdashboard");
    expect(screen.queryByLabelText("Nome completo")).toBeNull();
  });

  it("renderiza cadastro e exige campos e confirmação", async () => {
    render(<AuthForm mode="register" />);
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(screen.getByText(/Informe seu nome completo/)).toBeTruthy();
    expect(screen.getByText("Informe um e-mail válido.")).toBeTruthy();
    expect(apiRequest).not.toHaveBeenCalled();
    fill("Nome completo", "Synthetic Professional");
    credentials();
    fill("Confirmar senha", "different password");
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    expect(screen.getByText("As senhas não coincidem.")).toBeTruthy();
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("mostra e oculta senha sem enviar o formulário", () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText("Senha").getAttribute("type")).toBe(
      "password",
    );
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("Senha").getAttribute("type")).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(screen.getByLabelText("Senha").getAttribute("type")).toBe(
      "password",
    );
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("impede envio duplicado, exibe carregamento e redireciona após login", async () => {
    let release!: (value: unknown) => void;
    vi.mocked(apiRequest).mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    const view = render(
      <AuthForm mode="login" destination="/dashboard/calendar" />,
    );
    credentials();
    fireEvent.submit(view.container.querySelector("form")!);
    fireEvent.submit(view.container.querySelector("form")!);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole("button", { name: "Entrando…" })
        .hasAttribute("disabled"),
    ).toBe(true);
    await act(async () => {
      release(user);
    });
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/dashboard/calendar"),
    );
    expect(router.refresh).toHaveBeenCalled();
  });

  it("cadastra sem enviar confirmação e-mail normalizado e destino seguro", async () => {
    vi.mocked(apiRequest).mockResolvedValue(user);
    render(<AuthForm mode="register" destination="https://evil.example" />);
    fill("Nome completo", "Synthetic Professional");
    credentials();
    fill("E-mail", " SYNTHETIC@EXAMPLE.TEST ");
    fill("Confirmar senha", "synthetic password for tests");
    fireEvent.click(screen.getByRole("button", { name: "Criar minha conta" }));
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith("/dashboard"),
    );
    expect(apiRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        name: user.name,
        email: user.email,
        password: "synthetic password for tests",
      },
    });
  });

  it.each([401, 403, 409, 429, 503, 0])(
    "exibe erro acessível e permite tentar novamente: HTTP %s",
    async (status) => {
      vi.mocked(apiRequest).mockRejectedValue(
        new ApiError(status, "Synthetic safe error"),
      );
      render(<AuthForm mode="login" />);
      credentials();
      fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
      await waitFor(() =>
        expect(screen.getByRole("alert").textContent).toBe(
          "Synthetic safe error",
        ),
      );
      expect(
        screen.getByRole("button", { name: "Entrar" }).hasAttribute("disabled"),
      ).toBe(false);
      expect(router.replace).not.toHaveBeenCalled();
    },
  );

  it("logout envia a operação e invalida a navegação privada", async () => {
    vi.mocked(apiRequest).mockResolvedValue(undefined);
    render(<AccountMenu user={user} />);
    fireEvent.click(screen.getByLabelText(`Conta de ${user.name}`));
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(apiRequest).toHaveBeenCalledWith("/auth/logout", {
      method: "POST",
      body: {},
    });
    expect(router.refresh).toHaveBeenCalled();
  });

  it("falha no logout não informa sucesso nem abandona a sessão", async () => {
    vi.mocked(apiRequest).mockRejectedValue(
      new ApiError(0, "Não foi possível conectar."),
    );
    render(<AccountMenu user={user} />);
    fireEvent.click(screen.getByLabelText(`Conta de ${user.name}`));
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe(
        "Não foi possível conectar.",
      ),
    );
    expect(router.replace).not.toHaveBeenCalled();
  });
});
