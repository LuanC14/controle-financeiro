import { formatReference } from "@/lib/format";

/** Traduz o erro do Postgres em uma mensagem para o dono. */
export function closeMonthErrorMessage(reference: string, dbMessage: string) {
  if (dbMessage.includes("duplicate")) {
    return `${formatReference(reference)} já foi encerrado.`;
  }
  return dbMessage;
}
