export type ApiConnection = "loading" | "connected" | "error";

export function isHealthyResponse(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "ok" &&
    "service" in value &&
    value.service === "bookly-api" &&
    "database" in value &&
    value.database === "connected"
  );
}
