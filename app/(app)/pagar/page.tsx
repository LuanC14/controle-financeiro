import Link from "next/link";
import {
  AddButton, AddCategoryForm, AddCheckpointButton, CategoryCell, DateCell,
  DeleteButton, MoneyCell, PersistCell, StatusCell, TextCell,
} from "@/components/cells";
import { emptyRow, footRow, row, table, tableWrap, tbody, tfoot, thead } from "@/components/table-styles";
import { getCards, getCategories, getExpenses } from "@/lib/data";
import { formatBRL } from "@/lib/format";
import { lastCheckpointAmount } from "@/lib/types";

const fixoCell =
  "px-3 py-1 text-center max-md:flex max-md:items-center max-md:gap-1 max-md:px-1 max-md:text-xs max-md:text-zinc-500";

export default async function PagarPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const { aba } = await searchParams;
  const tab = aba === "geral" ? "geral" : "cartoes";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Valores a pagar</h1>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: "cartoes", label: "Faturas de cartão" },
          { id: "geral", label: "Geral" },
        ].map((t) => (
          <Link
            key={t.id}
            href={`/pagar?aba=${t.id}`}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm ${
              tab === t.id
                ? "border-emerald-600 font-medium"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "cartoes" ? <Cartoes /> : <Geral />}
    </div>
  );
}

async function Geral() {
  const [expenses, categories] = await Promise.all([getExpenses(), getCategories()]);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <div className={tableWrap}>
        <table className={table}>
          <thead className={thead}>
            <tr>
              <th className="px-3 py-2">Descrição</th>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2 text-right">Valor</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center" title="Manter no próximo mês">Fixo</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className={tbody}>
            {expenses.length === 0 && (
              <tr className={emptyRow}>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum gasto geral ainda (boletos, pix, gastos variáveis…).
                </td>
              </tr>
            )}
            {expenses.map((e) => (
              <tr key={e.id} className={row}>
                <td className="px-1 py-1 max-md:order-1 max-md:min-w-0 max-md:flex-1">
                  <TextCell table="expense_items" id={e.id} field="description" value={e.description} placeholder="Descrição" />
                </td>
                <td className="px-1 py-1 max-md:order-3 max-md:w-full">
                  <CategoryCell id={e.id} value={e.category_id} categories={categories} />
                </td>
                <td className="px-1 py-1 max-md:order-4 max-md:w-40">
                  <MoneyCell table="expense_items" id={e.id} value={e.amount} />
                </td>
                <td className="px-3 py-1 max-md:order-5 max-md:px-1">
                  <StatusCell table="expense_items" id={e.id} value={e.status} doneLabel="Pago" />
                </td>
                <td className={`${fixoCell} max-md:order-6`}>
                  <PersistCell table="expense_items" id={e.id} value={e.persist} />
                  <span className="md:hidden">Fixo</span>
                </td>
                <td className="px-1 py-1 max-md:order-2"><DeleteButton table="expense_items" id={e.id} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot className={tfoot}>
            <tr className={footRow}>
              <td className="px-3 py-2 max-md:p-0" colSpan={2}>Total geral</td>
              <td className="px-3 py-2 text-right tabular-nums max-md:p-0">{formatBRL(total)}</td>
              <td colSpan={3} className="max-md:hidden" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AddButton table="expense_items" label="Adicionar linha" />
        <AddCategoryForm />
      </div>
    </>
  );
}

async function Cartoes() {
  const cards = await getCards();
  const total = cards.reduce((s, c) => s + lastCheckpointAmount(c), 0);

  return (
    <>
      <p className="text-sm text-zinc-500">
        Cada pit-stop registra a fatura naquele momento, sem sobrescrever os anteriores. O resultado
        usa sempre o último.
      </p>

      <div className={tableWrap}>
        <table className={table}>
          <thead className={thead}>
            <tr>
              <th className="px-3 py-2">Cartão</th>
              <th className="px-3 py-2">Pit-stops</th>
              <th className="px-3 py-2 text-right">Atual</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center" title="Manter no próximo mês">Fixo</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className={tbody}>
            {cards.length === 0 && (
              <tr className={emptyRow}>
                <td colSpan={6} className="px-3 py-6 text-center text-zinc-500">
                  Nenhum cartão ainda.
                </td>
              </tr>
            )}
            {cards.map((c) => (
              <tr key={c.id} className={`${row} align-top`}>
                <td className="min-w-40 px-1 py-2 max-md:order-1 max-md:min-w-0 max-md:flex-1 max-md:py-0">
                  <TextCell table="cards" id={c.id} field="name" value={c.name} placeholder="Nome do cartão" />
                </td>
                <td className="px-2 py-2 max-md:order-3 max-md:w-full max-md:min-w-0 max-md:px-0 max-md:py-1">
                  <div className="flex items-start gap-2 overflow-x-auto pb-1 md:max-w-[26rem]">
                    {c.checkpoints.map((cp, idx) => {
                      const prev = idx > 0 ? c.checkpoints[idx - 1].amount : null;
                      const diff = prev === null ? null : cp.amount - prev;
                      return (
                        <div
                          key={cp.id}
                          className="min-w-36 shrink-0 rounded-md border border-zinc-200 p-1.5 dark:border-zinc-800"
                        >
                          <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
                            <span>{cp.seq}º Pit-stop</span>
                            <DeleteButton
                              table="card_checkpoints"
                              id={cp.id}
                              confirmText="Remover este pit-stop?"
                            />
                          </div>
                          <DateCell id={cp.id} value={cp.date} />
                          <MoneyCell table="card_checkpoints" id={cp.id} value={cp.amount} />
                          {diff !== null && diff !== 0 && (
                            <div
                              className={`px-2 text-xs tabular-nums ${
                                diff > 0 ? "text-red-600" : "text-emerald-600"
                              }`}
                            >
                              {diff > 0 ? "▲ +" : "▼ "}
                              {formatBRL(diff)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <AddCheckpointButton cardId={c.id} />
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-medium tabular-nums max-md:order-4 max-md:flex-1 max-md:p-0 max-md:text-left">
                  <span className="text-xs font-normal text-zinc-500 md:hidden">Atual </span>
                  {formatBRL(lastCheckpointAmount(c))}
                </td>
                <td className="px-3 py-3 max-md:order-5 max-md:p-0">
                  <StatusCell table="cards" id={c.id} value={c.status} doneLabel="Pago" />
                </td>
                <td className={`${fixoCell} max-md:order-6 py-3`}>
                  <PersistCell table="cards" id={c.id} value={c.persist} />
                  <span className="md:hidden">Fixo</span>
                </td>
                <td className="px-1 py-2 max-md:order-2 max-md:p-0">
                  <DeleteButton table="cards" id={c.id} confirmText={`Remover o cartão "${c.name}" e todos os pit-stops?`} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className={tfoot}>
            <tr className={footRow}>
              <td className="px-3 py-2 max-md:p-0" colSpan={2}>
                Total das faturas <span className="font-normal text-zinc-500">(último pit-stop)</span>
              </td>
              <td className="px-3 py-2 text-right tabular-nums max-md:p-0">{formatBRL(total)}</td>
              <td colSpan={3} className="max-md:hidden" />
            </tr>
          </tfoot>
        </table>
      </div>

      <div><AddButton table="cards" values={{ name: "Novo cartão" }} label="Adicionar cartão" /></div>
    </>
  );
}
