export type Status = "pending" | "done";

export type Income = {
  id: string;
  description: string;
  amount: number;
  status: Status;
  persist: boolean;
};

export type Expense = Income & { category_id: string | null };

export type Category = { id: string; name: string };

export type Checkpoint = {
  id: string;
  card_id: string;
  seq: number;
  date: string;
  amount: number;
};

export type Card = {
  id: string;
  name: string;
  status: Status;
  persist: boolean;
  checkpoints: Checkpoint[];
};

export type SnapshotData = {
  totals: {
    income: number;
    expenseGeneral: number;
    expenseCards: number;
    expenseTotal: number;
    result: number;
  };
  income: { description: string; amount: number; status: Status; persist: boolean }[];
  expenses: {
    description: string;
    amount: number;
    status: Status;
    persist: boolean;
    category: string | null;
  }[];
  cards: {
    name: string;
    status: Status;
    persist: boolean;
    checkpoints: { seq: number; date: string; amount: number }[];
  }[];
};

export type Snapshot = {
  id: string;
  reference: string;
  closed_at: string;
  data: SnapshotData;
};

export function lastCheckpointAmount(card: { checkpoints: { amount: number }[] }) {
  const n = card.checkpoints.length;
  return n ? Number(card.checkpoints[n - 1].amount) : 0;
}
