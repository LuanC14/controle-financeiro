"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type CheckpointMode, nextCheckpointAmount } from "@/lib/checkpoint";
import { closeMonthErrorMessage } from "@/lib/close-month";
import { createClient } from "@/lib/supabase/server";

const TABLES = [
  "income_items",
  "expense_items",
  "cards",
  "card_checkpoints",
  "categories",
] as const;
type Table = (typeof TABLES)[number];

const SIGNUP_CLOSED_MESSAGE =
  "O limite de contas deste app foi atingido. Entre com uma conta existente.";

function assertTable(table: string): asserts table is Table {
  if (!(TABLES as readonly string[]).includes(table)) {
    throw new Error("Tabela inválida");
  }
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function addRow(table: string, values: Record<string, unknown> = {}) {
  assertTable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).insert(values);
  if (error) throw new Error(error.message);
  refresh();
}

export async function updateRow(table: string, id: string, patch: Record<string, unknown>) {
  assertTable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteRow(table: string, id: string) {
  assertTable(table);
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
}

/** Novo pit-stop: repete o valor do anterior como ponto de partida. */
// O valor é recalculado aqui a partir do último pit-stop gravado, não do que a tela mostrava.
export async function addCheckpoint(cardId: string, mode: CheckpointMode, values: number[]) {
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("card_checkpoints")
    .select("seq, amount")
    .eq("card_id", cardId)
    .order("seq", { ascending: false })
    .limit(1)
    .maybeSingle();

  const amount = nextCheckpointAmount(Number(last?.amount ?? 0), mode, values);
  const { error } = await supabase.from("card_checkpoints").insert({
    card_id: cardId,
    seq: (last?.seq ?? 0) + 1,
    amount,
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function closeMonth(formData: FormData) {
  const reference = String(formData.get("reference") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_month", { p_reference: reference });
  if (error) {
    const msg = closeMonthErrorMessage(reference, error.message);
    redirect(`/resultado?erro=${encodeURIComponent(msg)}`);
  }
  refresh();
  redirect(`/historico/${reference}`);
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) redirect(`/login?erro=${encodeURIComponent("E-mail ou senha inválidos.")}`);
  redirect("/receber");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  // O trigger do banco é a trava real; aqui só damos uma mensagem clara.
  const { data: open } = await supabase.rpc("signup_open");
  if (open === false) {
    redirect(`/login?erro=${encodeURIComponent(SIGNUP_CLOSED_MESSAGE)}`);
  }
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) {
    // Corrida entre dois cadastros: o trigger recusou, mas a API devolve um erro genérico.
    const closed = error.message.toLowerCase().includes("database error");
    redirect(`/login?erro=${encodeURIComponent(closed ? SIGNUP_CLOSED_MESSAGE : error.message)}`);
  }
  if (!data.session) {
    redirect(`/login?info=${encodeURIComponent("Conta criada. Agora é só entrar.")}`);
  }
  redirect("/receber");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
