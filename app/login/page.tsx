import { signIn, signUp } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; info?: string }>;
}) {
  const { erro, info } = await searchParams;
  const configured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const field =
    "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2.5 text-base md:text-sm dark:border-zinc-700";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-16">
      <h1 className="text-2xl font-semibold">Controle Financeiro</h1>

      {!configured && (
        <p className="rounded-md bg-amber-100 p-3 text-sm text-amber-900">
          Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo <code>.env.local</code>.
        </p>
      )}
      {erro && <p className="rounded-md bg-red-100 p-3 text-sm text-red-900">{erro}</p>}
      {info && <p className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-900">{info}</p>}

      <form className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="E-mail" className={field} />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Senha"
          className={field}
        />
        <button
          formAction={signIn}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Entrar
        </button>
        <button
          formAction={signUp}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
        >
          Criar conta
        </button>
      </form>
    </main>
  );
}
