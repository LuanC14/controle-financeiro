import { describe, expect, it } from "vitest";
import { closeMonthErrorMessage } from "@/lib/close-month";

describe("closeMonthErrorMessage", () => {
  it("mês repetido usa o nome do mês, não o código", () => {
    const msg = closeMonthErrorMessage(
      "2026-11",
      'duplicate key value violates unique constraint "month_snapshots_user_id_reference_key"',
    );
    expect(msg).toBe("Novembro de 2026 já foi encerrado.");
  });

  it("outros erros passam como vieram", () => {
    expect(closeMonthErrorMessage("2026-11", "Não autenticado")).toBe("Não autenticado");
  });
});
