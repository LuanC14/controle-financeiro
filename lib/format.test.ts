import { describe, expect, it } from "vitest";
import { currentReference, formatBRL, formatDate, formatReference, parseBRL } from "@/lib/format";

describe("parseBRL", () => {
  it.each([
    ["1.234,56", 1234.56],
    ["1234,56", 1234.56],
    ["R$ 85,50", 85.5],
    ["1234.56", 1234.56],
    ["250", 250],
    ["-10,5", -10.5],
  ])("%s -> %d", (input, expected) => {
    expect(parseBRL(input)).toBe(expected);
  });

  it("devolve 0 para texto sem número", () => {
    expect(parseBRL("")).toBe(0);
    expect(parseBRL("abc")).toBe(0);
  });
});

describe("formatBRL", () => {
  it("formata em reais", () => {
    expect(formatBRL(1234.5).replace(/\s/g, " ")).toBe("R$ 1.234,50");
  });
});

describe("datas", () => {
  it("formatDate converte ISO para dd/mm/aaaa sem mudar de fuso", () => {
    expect(formatDate("2026-10-05")).toBe("05/10/2026");
  });

  it("formatReference escreve o mês por extenso", () => {
    expect(formatReference("2026-03")).toBe("Março de 2026");
  });

  it("currentReference tem o formato AAAA-MM", () => {
    expect(currentReference()).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });
});
