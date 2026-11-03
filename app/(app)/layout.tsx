import Link from "next/link";
import { signOut } from "@/app/actions";

const links = [
  { href: "/receber", label: "A receber" },
  { href: "/pagar", label: "A pagar" },
  { href: "/resultado", label: "Resultado" },
  { href: "/historico", label: "Histórico" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <span className="font-semibold">💰 Controle</span>
          <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form action={signOut}>
            <button className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </>
  );
}
