// Prova o isolamento entre usuários contra um Supabase real (local ou cloud).
// Cria 2 usuários temporários, tenta ler/alterar dados cruzados e apaga tudo no final.
// Variáveis: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !service) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY.");
  process.exitCode = 1;
} else {
  await main();
}

async function main() {
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const stamp = Date.now();
  const password = `Tmp-${stamp}-${Math.random().toString(36).slice(2)}`;
  const users = [];
  let passed = 0;
  let failed = 0;

  const check = (name, ok) => {
    console.log(`${ok ? "✓" : "✗"} ${name}`);
    if (ok) passed++;
    else failed++;
  };

  try {
    for (const tag of ["a", "b"]) {
      const email = `rls-${tag}-${stamp}@example.com`;
      const { data, error } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
      });
      if (error) throw error;
      const client = createClient(url, anon, { auth: { persistSession: false } });
      const { error: signInError } = await client.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      users.push({ id: data.user.id, client });
    }
    const [a, b] = users;

    // A grava dados.
    await a.client.from("income_items").insert({ description: "Salário", amount: 1000, persist: true });
    const { data: card } = await a.client.from("cards").insert({ name: "PicPay" }).select().single();
    await a.client.from("card_checkpoints").insert([
      { card_id: card.id, seq: 1, amount: 250 },
      { card_id: card.id, seq: 2, amount: 450 },
    ]);
    const { data: own } = await a.client.from("income_items").select("id");
    check("A enxerga as próprias receitas", own?.length === 1);

    // B tenta enxergar e alterar.
    for (const table of ["income_items", "expense_items", "cards", "card_checkpoints", "categories", "month_snapshots"]) {
      const { data } = await b.client.from(table).select("id");
      check(`B não lê ${table} de A`, (data ?? []).length === 0);
    }
    const { error: forged } = await b.client
      .from("income_items")
      .insert({ user_id: a.id, description: "forjado", amount: 1 });
    check("B não grava em nome de A", !!forged);
    await b.client.from("income_items").update({ amount: 0 }).eq("id", own[0].id);
    await b.client.from("cards").delete().eq("id", card.id);
    const { data: still } = await a.client.from("income_items").select("amount");
    const { data: stillCard } = await a.client.from("cards").select("id");
    check("update/delete de B não afetam A", still?.[0]?.amount === 1000 && stillCard?.length === 1);

    // Função de encerramento: só autenticado, só os dados de quem chama.
    const anonClient = createClient(url, anon, { auth: { persistSession: false } });
    const { error: anonErr } = await anonClient.rpc("close_month", { p_reference: "2026-10" });
    check("anônimo não executa close_month", !!anonErr);

    const { error: closeErr } = await a.client.rpc("close_month", { p_reference: "2026-10" });
    check("A encerra o mês", !closeErr);
    const { data: snaps } = await a.client.from("month_snapshots").select("data");
    check("snapshot usa o último pit-stop (450)", Number(snaps?.[0]?.data?.totals?.expenseCards) === 450);
    const { data: bSnaps } = await b.client.from("month_snapshots").select("id");
    check("B não vê o snapshot de A", (bSnaps ?? []).length === 0);
  } catch (e) {
    console.error("Erro inesperado:", e.message ?? e);
    failed++;
  } finally {
    for (const u of users) await admin.auth.admin.deleteUser(u.id);
  }

  console.log(`\n${passed} ok, ${failed} falhas`);
  process.exitCode = failed ? 1 : 0;
}
