import { closeMonth } from "@/app/actions";
import { Summary } from "@/components/report";
import { getCards, getExpenses, getIncome } from "@/lib/data";
import { computeTotals } from "@/lib/totals";
import { currentReference, formatBRL } from "@/lib/format";
import { lastCheckpointAmount } from "@/lib/types";

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const [income, expenses, cards] = await Promise.all([getIncome(), getExpenses(), getCards()]);
  const totals = computeTotals(income, expenses, cards);

  const row = "flex justify-between py-1.5 text-sm";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Resultado do mês</h1>
        <p className="text-sm text-zinc-500">
          Valor previsto/estimado: tudo que você tem a receber menos tudo que tem a pagar.
        </p>
      </div>

      {erro && <p className="rounded-md bg-red-100 p-3 text-sm text-red-900">{erro}</p>}

      <Summary totals={totals} label="Previsto para gastar (estimado)" />

      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-2 font-medium">Composição do que pagar</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {cards.map((c) => (
            <div key={c.id} className={row}>
              <span>{c.name}</span>
              <span className="tabular-nums">{formatBRL(lastCheckpointAmount(c))}</span>
            </div>
          ))}
          <div className={row}>
            <span>Gastos gerais</span>
            <span className="tabular-nums">{formatBRL(totals.expenseGeneral)}</span>
          </div>
        </div>
      </div>

      <form
        action={closeMonth}
        className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 className="font-medium">Encerrar mês</h2>
        <p className="text-sm text-zinc-500">
          Gera um snapshot somente leitura (incluindo pendentes) e prepara o próximo mês: linhas
          marcadas como “Fixo” e os cartões permanecem com status Pendente; os pit-stops e as
          demais linhas são removidos.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Mês de referência
            <input
              type="month"
              name="reference"
              required
              defaultValue={currentReference()}
              className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
            />
          </label>
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Encerrar mês
          </button>
        </div>
      </form>
    </div>
  );
}
