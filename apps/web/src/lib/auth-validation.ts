export type AuthMode = "login" | "register";
export type AuthFields = {
  name: string;
  email: string;
  password: string;
  confirmation: string;
};
export type AuthErrors = Partial<Record<keyof AuthFields, string>>;

export function safeDestination(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return "/dashboard";
  try {
    const url = new URL(value, "https://bookly.invalid");
    if (
      url.origin !== "https://bookly.invalid" ||
      (url.pathname !== "/dashboard" && !url.pathname.startsWith("/dashboard/"))
    )
      return "/dashboard";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/dashboard";
  }
}

export function validateAuthFields(
  mode: AuthMode,
  fields: AuthFields,
): AuthErrors {
  const errors: AuthErrors = {};
  if (
    mode === "register" &&
    ([...fields.name.trim()].length < 2 || [...fields.name.trim()].length > 100)
  )
    errors.name = "Informe seu nome completo, entre 2 e 100 caracteres.";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ||
    fields.email.trim().length > 254
  )
    errors.email = "Informe um e-mail válido.";
  const length = [...fields.password].length;
  if (!length) errors.password = "Informe sua senha.";
  else if (length > 128)
    errors.password = "A senha deve ter até 128 caracteres.";
  else if (mode === "register" && (length < 15 || !/\S/.test(fields.password)))
    errors.password = "Use uma senha de 15 a 128 caracteres.";
  if (mode === "register" && fields.confirmation !== fields.password)
    errors.confirmation = "As senhas não coincidem.";
  return errors;
}
