import { signOut } from "@/app/actions";
import { BottomNav, TopNav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-zinc-200 bg-white pt-[env(safe-area-inset-top)] dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <span className="flex-1 font-semibold md:flex-none">💰 Controle</span>
          <TopNav />
          <form action={signOut}>
            <button className="py-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 md:pb-6">{children}</main>
      <BottomNav />
    </>
  );
}
