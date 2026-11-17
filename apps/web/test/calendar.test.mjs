import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addDays,
  addMonths,
  localDateKey,
  monthDates,
  weekDates,
  monthLabel,
  fullDateLabel,
} from "../src/lib/calendar.ts";

test("navega entre meses e anos sem perder dias", () => {
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2027-01-01", -1), "2026-12-31");
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-02-29", 1), "2028-03-01");
});

test("navegação de meses limita o dia ao último dia válido", () => {
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2028-01-31", 1), "2028-02-29");
  assert.equal(addMonths("2026-03-31", -1), "2026-02-28");
  assert.equal(addMonths("2026-12-17", 1), "2027-01-17");
});

test("grade mensal tem seis semanas contínuas, iniciadas na segunda-feira", () => {
  const dates = monthDates("2026-11-17");
  assert.equal(dates.length, 42);
  assert.equal(dates[0], "2026-10-26");
  assert.equal(dates.at(-1), "2026-12-06");
  for (let index = 1; index < dates.length; index++)
    assert.equal(dates[index], addDays(dates[index - 1], 1));
});

test("grade inclui todos os dias de um mês bissexto", () => {
  const dates = monthDates("2028-02-10");
  assert.equal(dates.filter((date) => date.startsWith("2028-02")).length, 29);
  assert.ok(dates.includes("2028-02-29"));
});

test("semana atravessa a mudança de ano corretamente", () => {
  assert.deepEqual(weekDates("2027-01-01"), [
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
  ]);
});

test("datas e rótulos permanecem estáveis com fusos e horário de verão", () => {
  const previous = process.env.TZ;
  try {
    for (const zone of [
      "America/Porto_Velho",
      "America/New_York",
      "Pacific/Auckland",
      "UTC",
    ]) {
      process.env.TZ = zone;
      assert.equal(addDays("2026-03-08", 1), "2026-03-09");
      assert.equal(addDays("2026-11-01", -1), "2026-10-31");
      assert.equal(monthLabel("2026-11-17"), "novembro de 2026");
      assert.match(
        fullDateLabel("2026-11-17"),
        /terça-feira, 17 de novembro de 2026/,
      );
    }
    process.env.TZ = "America/Porto_Velho";
    assert.equal(localDateKey(new Date("2026-11-18T01:30:00Z")), "2026-11-17");
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
