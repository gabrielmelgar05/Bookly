import assert from "node:assert/strict";
import { test } from "node:test";
import { isHealthyResponse } from "../src/types/health.ts";

test("healthcheck exige confirmação da API e do banco", () => {
  assert.equal(
    isHealthyResponse({
      status: "ok",
      service: "bookly-api",
      database: "connected",
    }),
    true,
  );
  for (const value of [
    null,
    undefined,
    "ok",
    {},
    { status: "ok" },
    { status: "ok", service: "other", database: "connected" },
    { status: "ok", service: "bookly-api", database: "disconnected" },
  ]) {
    assert.equal(isHealthyResponse(value), false);
  }
});
