import { describe, expect, it } from "vitest";
import { nextCheckpointAmount } from "@/lib/checkpoint";

describe("nextCheckpointAmount", () => {
  it("acrescentar soma as parcelas ao valor atual", () => {
    expect(nextCheckpointAmount(400, "add", [50])).toBe(450);
    expect(nextCheckpointAmount(400, "add", [50, 25.5, 10])).toBe(485.5);
  });

  it("acrescentar soma em centavos, sem erro de float", () => {
    expect(nextCheckpointAmount(0.1, "add", [0.2])).toBe(0.3);
  });

  it("acrescentar aceita estorno (parcela negativa)", () => {
    expect(nextCheckpointAmount(400, "add", [-100])).toBe(300);
  });

  it("reescrever ignora o valor atual", () => {
    expect(nextCheckpointAmount(400, "set", [1234.56])).toBe(1234.56);
  });

  it("recusa entradas inválidas", () => {
    expect(() => nextCheckpointAmount(400, "add", [])).toThrow();
    expect(() => nextCheckpointAmount(400, "add", [NaN])).toThrow();
    expect(() => nextCheckpointAmount(400, "set", [1, 2])).toThrow();
    expect(() => nextCheckpointAmount(400, "x" as never, [1])).toThrow();
    expect(() => nextCheckpointAmount(0, "set", [1e13])).toThrow();
    expect(() => nextCheckpointAmount(0, "add", ["5" as never])).toThrow();
  });
});
