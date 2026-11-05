"use client";

import { useTransition } from "react";
import { addRow, deleteRow, updateRow } from "@/app/actions";
import { formatBRL, parseBRL } from "@/lib/format";
import type { Category, Status } from "@/lib/types";

// No celular os campos têm fundo visível (não há hover para revelar que são editáveis);
// 16px evita o zoom automático do iOS ao focar.
const input =
  "w-full min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm hover:border-zinc-300 focus:border-emerald-500 focus:bg-white focus:outline-none dark:hover:border-zinc-700 dark:focus:bg-zinc-900 max-md:border-zinc-200 max-md:bg-zinc-50 max-md:py-2 max-md:text-base dark:max-md:border-zinc-800 dark:max-md:bg-zinc-900";

// Campos dentro do cartão de pit-stop: sem fundo próprio, mais justos.
const compactInput =
  "w-full min-w-0 rounded border border-transparent bg-transparent px-1 py-0.5 hover:border-zinc-300 focus:border-emerald-500 focus:bg-white focus:outline-none dark:hover:border-zinc-700 dark:focus:bg-zinc-900";

export function TextCell({
  table, id, field, value, placeholder,
}: { table: string; id: string; field: string; value: string; placeholder?: string }) {
  const [pending, start] = useTransition();
  return (
    <input
      key={value}
      defaultValue={value}
      placeholder={placeholder}
      aria-label={placeholder}
      disabled={pending}
      className={input}
      onBlur={(e) => {
        const v = e.target.value.trim();
        if (v !== value) start(() => updateRow(table, id, { [field]: v }));
      }}
    />
  );
}

export function MoneyCell({
  table, id, field = "amount", value, compact = false,
}: { table: string; id: string; field?: string; value: number; compact?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input
      key={value}
      defaultValue={formatBRL(value)}
      inputMode="decimal"
      aria-label="Valor"
      disabled={pending}
      className={
        compact
          ? `${compactInput} text-base font-medium tabular-nums md:text-sm`
          : `${input} text-right tabular-nums max-md:text-left max-md:font-medium`
      }
      onFocus={(e) => e.target.select()}
      onBlur={(e) => {
        const v = parseBRL(e.target.value);
        e.target.value = formatBRL(v);
        if (v !== value) start(() => updateRow(table, id, { [field]: v }));
      }}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
    />
  );
}

export function DateCell({ id, value }: { id: string; value: string }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="date"
      key={value}
      defaultValue={value}
      aria-label="Data do pit-stop"
      disabled={pending}
      className={`${compactInput} text-xs text-zinc-500 [&::-webkit-calendar-picker-indicator]:ml-0.5 [&::-webkit-calendar-picker-indicator]:size-3 [&::-webkit-calendar-picker-indicator]:opacity-50`}
      onChange={(e) => {
        if (e.target.value && e.target.value !== value) {
          start(() => updateRow("card_checkpoints", id, { date: e.target.value }));
        }
      }}
    />
  );
}

export function StatusCell({
  table, id, value, doneLabel,
}: { table: string; id: string; value: Status; doneLabel: string }) {
  const [pending, start] = useTransition();
  const done = value === "done";
  return (
    <button
      disabled={pending}
      onClick={() => start(() => updateRow(table, id, { status: done ? "pending" : "done" }))}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        done
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      }`}
    >
      {done ? doneLabel : "Pendente"}
    </button>
  );
}

export function PersistCell({ table, id, value }: { table: string; id: string; value: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      checked={value}
      disabled={pending}
      title="Manter esta linha no próximo mês"
      aria-label="Manter no próximo mês"
      className="size-5 accent-emerald-600 md:size-4"
      onChange={(e) => start(() => updateRow(table, id, { persist: e.target.checked }))}
    />
  );
}

export function CategoryCell({
  id, value, categories,
}: { id: string; value: string | null; categories: Category[] }) {
  const [pending, start] = useTransition();
  return (
    <select
      value={value ?? ""}
      aria-label="Categoria"
      disabled={pending}
      className={input}
      onChange={(e) =>
        start(() => updateRow("expense_items", id, { category_id: e.target.value || null }))
      }
    >
      <option value="">Sem categoria</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );
}

export function DeleteButton({
  table, id, confirmText, small = false,
}: { table: string; id: string; confirmText?: string; small?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      aria-label="Remover"
      title="Remover"
      className={`rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 ${
        small ? "px-1.5 py-0.5 text-xs" : "px-2.5 py-1.5"
      }`}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(() => deleteRow(table, id));
      }}
    >
      ✕
    </button>
  );
}

export function AddButton({
  table, values, label,
}: { table: string; values?: Record<string, unknown>; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => addRow(table, values))}
      className="rounded-md border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-400"
    >
      + {label}
    </button>
  );
}

export function AddCategoryForm() {
  const [pending, start] = useTransition();
  return (
    <form
      className="flex gap-2"
      action={(fd) => {
        const name = String(fd.get("name") ?? "").trim();
        if (name) start(() => addRow("categories", { name }));
      }}
    >
      <input
        name="name"
        placeholder="Nova categoria"
        className="rounded-md border border-zinc-300 bg-transparent px-2 py-2 text-base md:py-1.5 md:text-sm dark:border-zinc-700"
      />
      <button disabled={pending} className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
        Adicionar
      </button>
    </form>
  );
}
