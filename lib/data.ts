import { createClient } from "@/lib/supabase/server";
import type { Card, Category, Checkpoint, Expense, Income, Snapshot } from "@/lib/types";

export async function getIncome(): Promise<Income[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("income_items")
    .select("id, description, amount, status, persist")
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount) })) as Income[];
}

export async function getExpenses(): Promise<Expense[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expense_items")
    .select("id, description, amount, status, persist, category_id")
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount) })) as Expense[];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCards(): Promise<Card[]> {
  const supabase = await createClient();
  const [cards, checkpoints] = await Promise.all([
    supabase.from("cards").select("id, name, status, persist").order("created_at"),
    supabase
      .from("card_checkpoints")
      .select("id, card_id, seq, date, amount")
      .order("seq"),
  ]);
  if (cards.error) throw cards.error;
  if (checkpoints.error) throw checkpoints.error;

  return (cards.data ?? []).map((c) => ({
    ...c,
    checkpoints: (checkpoints.data ?? [])
      .filter((cp) => cp.card_id === c.id)
      .map((cp) => ({ ...cp, amount: Number(cp.amount) })) as Checkpoint[],
  })) as Card[];
}

export async function getSnapshots(): Promise<Snapshot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("month_snapshots")
    .select("id, reference, closed_at, data")
    .order("reference", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Snapshot[];
}

export async function getSnapshot(reference: string): Promise<Snapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("month_snapshots")
    .select("id, reference, closed_at, data")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw error;
  return (data as Snapshot | null) ?? null;
}
