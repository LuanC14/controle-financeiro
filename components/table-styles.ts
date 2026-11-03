// Tabelas viram cartões no celular (< md) e voltam a ser tabelas no desktop.
// No celular cada linha é um grid de 3 colunas com áreas nomeadas: a descrição ganha a linha inteira
// e valor/status/fixo ficam embaixo. Classes literais (não montadas) para o Tailwind encontrá-las.
export const tableWrap =
  "rounded-lg border border-zinc-200 bg-white md:overflow-x-auto dark:border-zinc-800 dark:bg-zinc-950";
export const table = "w-full table-fixed text-sm max-md:block";
export const thead =
  "bg-zinc-50 text-left text-xs uppercase text-zinc-500 max-md:hidden dark:bg-zinc-900";
export const tbody = "divide-y divide-zinc-100 max-md:block dark:divide-zinc-800";
export const tfoot = "max-md:block";
export const row =
  "max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto_auto] max-md:items-center max-md:gap-x-2 max-md:gap-y-2 max-md:p-3";
export const footRow =
  "border-t border-zinc-200 font-medium max-md:flex max-md:items-center max-md:justify-between max-md:px-3 max-md:py-3 dark:border-zinc-800";
export const emptyRow = "max-md:block";

// Layouts de linha no celular.
export const areasSimple = "max-md:[grid-template-areas:'desc_desc_del'_'amount_status_fixo']";
export const areasWithCategory =
  "max-md:[grid-template-areas:'desc_desc_del'_'cat_cat_cat'_'amount_status_fixo']";
export const areasCard =
  "max-md:[grid-template-areas:'desc_desc_del'_'stops_stops_stops'_'amount_status_fixo']";

// Células: posição no grid do celular + espaçamento no desktop.
export const cellDesc = "px-1 py-1.5 max-md:p-0 max-md:[grid-area:desc]";
export const cellCat = "px-1 py-1.5 max-md:p-0 max-md:[grid-area:cat]";
export const cellStops = "px-2 py-1.5 max-md:p-0 max-md:[grid-area:stops]";
export const cellAmount = "px-1 py-1.5 max-md:p-0 max-md:[grid-area:amount]";
export const cellStatus = "px-2 py-1.5 max-md:p-0 max-md:[grid-area:status]";
export const cellFixo =
  "px-2 py-1.5 text-center max-md:flex max-md:items-center max-md:gap-1.5 max-md:p-0 max-md:text-xs max-md:text-zinc-500 max-md:[grid-area:fixo]";
export const cellDel = "px-1 py-1.5 text-right max-md:p-0 max-md:[grid-area:del]";

// Larguras das colunas no desktop (tabela com layout fixo).
export const colAmount = "w-40";
export const colStatus = "w-28";
export const colFixo = "w-16";
export const colDel = "w-12";
