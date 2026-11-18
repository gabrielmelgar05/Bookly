"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { apiRequest, ApiError } from "@/lib/api-client";
import {
  safeDestination,
  validateAuthFields,
  type AuthMode,
  type AuthFields,
  type AuthErrors,
} from "@/lib/auth-validation";
import { isPublicUser } from "@/types/auth";

export function AuthForm({
  mode,
  destination = "/dashboard",
}: {
  mode: AuthMode;
  destination?: string;
}) {
  const register = mode === "register";
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const [fields, setFields] = useState<AuthFields>({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);

  function update(field: keyof AuthFields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setFailure("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const validation = validateAuthFields(mode, fields);
    setErrors(validation);
    setFailure("");
    const first = Object.keys(validation)[0];
    if (first) {
      form.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const user = await apiRequest<unknown>(`/auth/${mode}`, {
        method: "POST",
        body: {
          ...(register ? { name: fields.name.trim() } : {}),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
        },
      });
      if (!isPublicUser(user))
        throw new ApiError(
          0,
          "Não foi possível confirmar o acesso. Tente novamente.",
        );
      router.replace(safeDestination(destination));
      router.refresh();
    } catch (error) {
      setFailure(
        error instanceof ApiError
          ? error.message
          : "Não foi possível concluir. Tente novamente.",
      );
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <form
        method="post"
        ref={form}
        className="auth-form"
        onSubmit={submit}
        noValidate
        aria-busy={pending}
      >
        {register && (
          <div className="form-field">
            <label htmlFor="auth-name">Nome completo</label>
            <input
              id="auth-name"
              name="name"
              autoComplete="name"
              maxLength={100}
              required
              disabled={pending}
              value={fields.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Como podemos chamar você?"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "auth-name-error" : undefined}
            />
            {errors.name && (
              <p id="auth-name-error" className="field-error">
                {errors.name}
              </p>
            )}
          </div>
        )}
        <div className="form-field">
          <label htmlFor="auth-email">E-mail</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={pending}
            value={fields.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="Seu e-mail de acesso"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "auth-email-error" : undefined}
          />
          {errors.email && (
            <p id="auth-email-error" className="field-error">
              {errors.email}
            </p>
          )}
        </div>
        <PasswordField
          id="auth-password"
          name="password"
          label="Senha"
          autoComplete={register ? "new-password" : "current-password"}
          required
          maxLength={128}
          disabled={pending}
          value={fields.password}
          onChange={(event) => update("password", event.target.value)}
          error={errors.password}
          hint={
            register
              ? "Use de 15 a 128 caracteres. Uma frase longa é uma boa opção."
              : undefined
          }
        />
        {register && (
          <PasswordField
            id="auth-confirmation"
            name="confirmation"
            label="Confirmar senha"
            autoComplete="new-password"
            required
            maxLength={128}
            disabled={pending}
            value={fields.confirmation}
            onChange={(event) => update("confirmation", event.target.value)}
            error={errors.confirmation}
          />
        )}
        {failure && (
          <div role="alert" className="auth-error">
            {failure}
          </div>
        )}
        <Button type="submit" className="auth-submit" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle
                className="animate-spin"
                size={17}
                aria-hidden="true"
              />
              {register ? "Criando sua conta…" : "Entrando…"}
            </>
          ) : (
            <>
              {register ? "Criar minha conta" : "Entrar"}
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </Button>
      </form>
      <p className="auth-alternate">
        {register ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
        <Link
          href={`${register ? "/login" : "/register"}?next=${encodeURIComponent(safeDestination(destination))}`}
        >
          {register ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </>
  );
}
