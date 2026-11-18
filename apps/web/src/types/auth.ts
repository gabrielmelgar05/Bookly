export type PublicUser = { id: string; name: string; email: string };
export const SESSION_COOKIE = "bookly_session";

export function isPublicUser(value: unknown): value is PublicUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string"
  );
}
