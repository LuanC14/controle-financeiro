import { AddButton, DeleteButton, MoneyCell, PersistCell, StatusCell, TextCell } from "@/components/cells";
import { getIncome } from "@/lib/data";
import { formatBRL } from "@/lib/format";

export default async function ReceberPage() {
  const income = await getIncome();
  const total = income.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Valores a receber</h1>
        <p className="text-sm text-zinc-500">Salário, pix, empréstimos…</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center" title="Manter no próximo mês">Fixo</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {income.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum valor a receber ainda.
                </td>
              </tr>
            )}
            {income.map((i) => (
              <tr key={i.id}>
                <td className="px-1 py-1"><TextCell table="income_items" id={i.id} field="description" value={i.description} placeholder="Descrição" /></td>
                <td className="px-1 py-1"><MoneyCell table="income_items" id={i.id} value={i.amount} /></td>
                <td className="px-3 py-1"><StatusCell table="income_items" id={i.id} value={i.status} doneLabel="Recebido" /></td>
                <td className="px-3 py-1 text-center"><PersistCell table="income_items" id={i.id} value={i.persist} /></td>
                <td className="px-1 py-1"><DeleteButton table="income_items" id={i.id} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 font-medium dark:border-zinc-800">
              <td className="px-3 py-2">Total a receber</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatBRL(total)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      <div><AddButton table="income_items" label="Adicionar linha" /></div>
    </div>
  );
}
