"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/receber", label: "A receber", icon: "↓" },
  { href: "/pagar", label: "A pagar", icon: "↑" },
  { href: "/resultado", label: "Resultado", icon: "＝" },
  { href: "/historico", label: "Histórico", icon: "☰" },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

/** Links no topo, só no desktop. */
export function TopNav() {
  const active = useActive();
  return (
    <nav className="hidden flex-1 gap-1 text-sm md:flex">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={`whitespace-nowrap rounded-md px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
            active(l.href) ? "bg-zinc-100 font-medium dark:bg-zinc-800" : ""
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

/** Barra inferior fixa, só no celular. */
export function BottomNav() {
  const active = useActive();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-zinc-800 dark:bg-zinc-950"
    >
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
            active(l.href) ? "font-medium text-emerald-600" : "text-zinc-500"
          }`}
        >
          <span aria-hidden className="text-lg leading-none">{l.icon}</span>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
