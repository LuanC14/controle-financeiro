import Link from "next/link";
import { getSnapshots } from "@/lib/data";
import { formatBRL, formatReference } from "@/lib/format";

export default async function HistoricoPage() {
  const snapshots = await getSnapshots();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Histórico</h1>

      {snapshots.length === 0 && (
        <p className="text-sm text-zinc-500">Nenhum mês encerrado ainda.</p>
      )}

      <ul className="flex flex-col gap-2">
        {snapshots.map((s) => (
          <li key={s.id}>
            <Link
              href={`/historico/${s.reference}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <span className="font-medium">{formatReference(s.reference)}</span>
              <span
                className={`tabular-nums ${s.data.totals.result < 0 ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}
              >
                {formatBRL(s.data.totals.result)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
