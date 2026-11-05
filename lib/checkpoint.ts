// Como o novo pit-stop chega ao valor: "add" soma parcelas ao valor atual, "set" reescreve com um valor inteiro.
export type CheckpointMode = "add" | "set";

const MAX = 9_999_999_999.99; // limite de numeric(12,2)

/**
 * Valor do novo pit-stop. Soma em centavos para não acumular erro de float (0,1 + 0,2).
 * Parcelas negativas em "add" são permitidas (estorno). Lança erro em entrada inválida:
 * a server action é um endpoint público e recebe qualquer coisa.
 */
export function nextCheckpointAmount(current: number, mode: CheckpointMode, values: number[]): number {
  if (mode !== "add" && mode !== "set") throw new Error("Modo de pit-stop inválido.");
  if (!Array.isArray(values) || values.length === 0 || values.length > 50) {
    throw new Error("Informe pelo menos um valor.");
  }
  if (!values.every((v) => typeof v === "number" && Number.isFinite(v))) {
    throw new Error("Valor inválido.");
  }
  if (mode === "set" && values.length !== 1) throw new Error("Reescrever aceita um único valor.");

  const cents = (n: number) => Math.round(n * 100);
  const base = mode === "add" ? cents(current) : 0;
  const total = (base + values.reduce((s, v) => s + cents(v), 0)) / 100;

  if (Math.abs(total) > MAX) throw new Error("Valor fora do limite.");
  return total;
}
