"use client";

import { useRef, useState, useTransition } from "react";
import { addCheckpoint } from "@/app/actions";
import { type CheckpointMode, nextCheckpointAmount } from "@/lib/checkpoint";
import { formatBRL, parseBRL } from "@/lib/format";

const field =
  "w-full min-w-0 rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base tabular-nums focus:border-emerald-500 focus:outline-none dark:border-zinc-700";

let nextId = 0;
const newRow = () => ({ id: ++nextId, text: "" });

/** "+ Pit-stop": pergunta se o novo valor acrescenta ao atual ou reescreve o total. */
export function AddCheckpointButton({
  cardId, cardName, current,
}: { cardId: string; cardName: string; current: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<CheckpointMode>("add");
  const [rows, setRows] = useState([newRow()]);
  const [setText, setSetText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  // Só conta campos preenchidos: um "+" a mais vazio não bloqueia o salvar.
  const values =
    mode === "add"
      ? rows.filter((r) => r.text.trim()).map((r) => parseBRL(r.text))
      : setText.trim() ? [parseBRL(setText)] : [];
  let preview: number | null = null;
  try {
    preview = nextCheckpointAmount(current, mode, values);
  } catch {
    preview = null;
  }

  function open() {
    setMode("add");
    setRows([newRow()]);
    setSetText("");
    setError("");
    dialog.current?.showModal();
  }

  function save() {
    if (preview === null) return;
    start(async () => {
      try {
        await addCheckpoint(cardId, mode, values);
        dialog.current?.close();
      } catch {
        setError("Não foi possível salvar o pit-stop. Tente de novo.");
      }
    });
  }

  const tab = (m: CheckpointMode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`flex-1 rounded-md px-3 py-1.5 text-sm ${
        mode === m ? "bg-white font-medium shadow-sm dark:bg-zinc-800" : "text-zinc-500"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <button
        onClick={open}
        className="self-stretch whitespace-nowrap rounded-md border border-dashed border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-zinc-700 dark:text-zinc-400"
      >
        + Pit-stop
      </button>

      <dialog
        ref={dialog}
        aria-label={`Novo pit-stop de ${cardName}`}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-0 text-zinc-900 backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <form
          className="flex flex-col gap-4 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div>
            <h2 className="font-semibold">Novo pit-stop</h2>
            <p className="text-sm text-zinc-500">{cardName}</p>
          </div>

          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
            {tab("add", "Acrescentar")}
            {tab("set", "Reescrever")}
          </div>

          {mode === "add" ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Valor atual</span>
                <span className="font-medium tabular-nums">{formatBRL(current)}</span>
              </div>
              {rows.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-2">
                  <span className="w-4 text-center text-zinc-500">+</span>
                  <input
                    value={r.text}
                    autoFocus={idx === rows.length - 1}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-label={`Valor a acrescentar ${idx + 1}`}
                    className={field}
                    onChange={(e) =>
                      setRows(rows.map((x) => (x.id === r.id ? { ...x, text: e.target.value } : x)))
                    }
                  />
                  {rows.length > 1 && (
                    <button
                      type="button"
                      aria-label="Remover valor"
                      onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
                      className="rounded-md px-2 py-1.5 text-zinc-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setRows([...rows, newRow()])}
                className="self-start rounded-md px-2 py-1 text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
              >
                + outro valor
              </button>
            </div>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-500">Valor corrigido da fatura</span>
              <input
                value={setText}
                autoFocus
                inputMode="decimal"
                placeholder="0,00"
                className={field}
                onChange={(e) => setSetText(e.target.value)}
              />
            </label>
          )}

          <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="text-sm text-zinc-500">Novo pit-stop</span>
            <span className="text-lg font-semibold tabular-nums">
              {preview === null ? "—" : formatBRL(preview)}
            </span>
          </div>

          {error && <p className="rounded-md bg-red-100 p-2 text-sm text-red-900">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
            <button
              disabled={pending || preview === null}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Salvando…" : "Salvar pit-stop"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
