const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number) {
  return brl.format(value);
}

/** Aceita "1.234,56", "1234,56" ou "1234.56". */
export function parseBRL(input: string) {
  const text = input.replace(/[^\d,.-]/g, "");
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(",", ".")
    : text;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function currentReference() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function formatReference(ref: string) {
  const [y, m] = ref.split("-");
  return `${months[Number(m) - 1]} de ${y}`;
}
