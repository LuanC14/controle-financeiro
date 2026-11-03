import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadOnlyReport, Summary } from "@/components/report";
import { getSnapshot } from "@/lib/data";
import { formatReference } from "@/lib/format";

export default async function SnapshotPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const snapshot = await getSnapshot(ref);
  if (!snapshot) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/historico" className="text-sm text-zinc-500 hover:underline">
          ← Histórico
        </Link>
        <h1 className="text-xl font-semibold">{formatReference(snapshot.reference)}</h1>
        <p className="text-sm text-zinc-500">
          Encerrado em {new Date(snapshot.closed_at).toLocaleDateString("pt-BR")} · somente leitura
        </p>
      </div>

      <Summary totals={snapshot.data.totals} label="Resultado previsto (estimado)" />
      <ReadOnlyReport data={snapshot.data} />
    </div>
  );
}
