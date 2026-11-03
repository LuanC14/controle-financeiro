import { AddButton, DeleteButton, MoneyCell, PersistCell, StatusCell, TextCell } from "@/components/cells";
import {
  areasSimple, cellAmount, cellDel, cellDesc, cellFixo, cellStatus, colAmount, colDel, colFixo,
  colStatus, emptyRow, footRow, row, table, tableWrap, tbody, tfoot, thead,
} from "@/components/table-styles";
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

      <div className={tableWrap}>
        <table className={table}>
          <thead className={thead}>
            <tr>
              <th className="px-3 py-2">Descrição</th>
              <th className={`${colAmount} px-3 py-2 text-right`}>Valor</th>
              <th className={`${colStatus} px-3 py-2`}>Status</th>
              <th className={`${colFixo} px-3 py-2 text-center`} title="Manter no próximo mês">Fixo</th>
              <th className={colDel} />
            </tr>
          </thead>
          <tbody className={tbody}>
            {income.length === 0 && (
              <tr className={emptyRow}>
                <td colSpan={5} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum valor a receber ainda.
                </td>
              </tr>
            )}
            {income.map((i) => (
              <tr key={i.id} className={`${row} ${areasSimple}`}>
                <td className={cellDesc}>
                  <TextCell table="income_items" id={i.id} field="description" value={i.description} placeholder="Descrição" />
                </td>
                <td className={cellAmount}>
                  <MoneyCell table="income_items" id={i.id} value={i.amount} />
                </td>
                <td className={cellStatus}>
                  <StatusCell table="income_items" id={i.id} value={i.status} doneLabel="Recebido" />
                </td>
                <td className={cellFixo}>
                  <PersistCell table="income_items" id={i.id} value={i.persist} />
                  <span className="md:hidden">Fixo</span>
                </td>
                <td className={cellDel}><DeleteButton table="income_items" id={i.id} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className={tfoot}>
            <tr className={footRow}>
              <td className="px-3 py-2 max-md:p-0">Total a receber</td>
              <td className="px-3 py-2 text-right tabular-nums max-md:p-0">{formatBRL(total)}</td>
              <td colSpan={3} className="max-md:hidden" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div><AddButton table="income_items" label="Adicionar linha" /></div>
    </div>
  );
}
