import { formatBRL, formatDate } from "@/lib/format";
import type { SnapshotData } from "@/lib/types";

export function Summary({
  totals, label,
}: { totals: SnapshotData["totals"]; label: string }) {
  const positive = totals.result >= 0;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Stat title="Total a receber" value={totals.income} />
      <Stat title="Total a pagar" value={totals.expenseTotal} />
      <div
        className={`rounded-lg border p-4 ${
          positive
            ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
            : "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40"
        }`}
      >
        <div className="text-xs uppercase text-zinc-500">{label}</div>
        <div className="mt-1 text-2xl font-semibold tabular-nums">{formatBRL(totals.result)}</div>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs uppercase text-zinc-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{formatBRL(value)}</div>
    </div>
  );
}

const statusLabel = (s: string, done: string) => (s === "done" ? done : "Pendente");

/** Visão somente leitura dos itens (usada no histórico). */
export function ReadOnlyReport({ data }: { data: SnapshotData }) {
  const box =
    "overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";
  const th = "bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900";

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="font-medium">A receber</h2>
        <div className={box}>
          <table className="w-full min-w-[28rem] text-sm">
            <thead className={th}><tr>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.income.map((i, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">{i.description}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(i.amount)}</td>
                  <td className="px-3 py-2">{statusLabel(i.status, "Recebido")}</td>
                </tr>
              ))}
              {data.income.length === 0 && <Empty cols={3} />}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Faturas de cartão</h2>
        <div className={box}>
          <table className="w-full min-w-[28rem] text-sm">
            <thead className={th}><tr>
              <th className="px-3 py-2">Cartão</th>
              <th className="px-3 py-2">Pit-stops</th>
              <th className="px-3 py-2 text-right">Final</th>
              <th className="px-3 py-2">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.cards.map((c, idx) => {
                const last = c.checkpoints[c.checkpoints.length - 1];
                return (
                  <tr key={idx} className="align-top">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {c.checkpoints.length === 0 && "—"}
                      {c.checkpoints.map((cp) => (
                        <div key={cp.seq}>
                          {cp.seq}º ({formatDate(cp.date)}): {formatBRL(cp.amount)}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatBRL(last ? last.amount : 0)}
                    </td>
                    <td className="px-3 py-2">{statusLabel(c.status, "Pago")}</td>
                  </tr>
                );
              })}
              {data.cards.length === 0 && <Empty cols={4} />}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Gastos gerais</h2>
        <div className={box}>
          <table className="w-full min-w-[28rem] text-sm">
            <thead className={th}><tr>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.expenses.map((e, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2">{e.description}</td>
                  <td className="px-3 py-2 text-zinc-500">{e.category ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatBRL(e.amount)}</td>
                  <td className="px-3 py-2">{statusLabel(e.status, "Pago")}</td>
                </tr>
              ))}
              {data.expenses.length === 0 && <Empty cols={4} />}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Empty({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-4 text-center text-zinc-500">Sem itens.</td>
    </tr>
  );
}
