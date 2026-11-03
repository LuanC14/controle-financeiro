import { lastCheckpointAmount, type Card, type Expense, type Income } from "@/lib/types";

export function computeTotals(income: Income[], expenses: Expense[], cards: Card[]) {
  const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + Number(x.amount), 0);
  const incomeTotal = sum(income);
  const general = sum(expenses);
  // Cada fatura conta apenas o último pit-stop.
  const cardsTotal = cards.reduce((s, c) => s + lastCheckpointAmount(c), 0);
  return {
    income: incomeTotal,
    expenseGeneral: general,
    expenseCards: cardsTotal,
    expenseTotal: general + cardsTotal,
    result: incomeTotal - general - cardsTotal,
  };
}
