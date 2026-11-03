import { describe, expect, it } from "vitest";
import { computeTotals } from "@/lib/totals";
import type { Card, Expense, Income } from "@/lib/types";

const income = (amount: number): Income => ({
  id: String(amount), description: "", amount, status: "pending", persist: false,
});
const expense = (amount: number): Expense => ({ ...income(amount), category_id: null });
const card = (...amounts: number[]): Card => ({
  id: "c", name: "PicPay", status: "pending", persist: true,
  checkpoints: amounts.map((amount, i) => ({
    id: String(i), card_id: "c", seq: i + 1, date: "2026-10-01", amount,
  })),
});

describe("computeTotals", () => {
  it("fatura conta só o último pit-stop", () => {
    const t = computeTotals([income(1000)], [expense(200)], [card(250, 450)]);
    expect(t.expenseCards).toBe(450);
    expect(t.expenseTotal).toBe(650);
    expect(t.result).toBe(350);
  });

  it("cartão sem pit-stop vale zero", () => {
    expect(computeTotals([], [], [card()]).expenseCards).toBe(0);
  });

  it("resultado pode ser negativo", () => {
    expect(computeTotals([income(100)], [expense(300)], []).result).toBe(-200);
  });

  it("não ignora status: Pendente e Pago entram no previsto", () => {
    const paid: Expense = { ...expense(50), status: "done" };
    expect(computeTotals([], [expense(100), paid], []).expenseGeneral).toBe(150);
  });
});
