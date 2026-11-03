# Controle Financeiro

App de controle financeiro mensal: **A receber**, **A pagar** (Faturas de cartão com pit-stops + Geral) e **Resultado**, com encerramento de mês e histórico em snapshots somente leitura.

Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase (Postgres, Auth, RLS).

## Desenvolvimento local

Precisa de Docker Desktop ligado.

```bash
npm install
npm run db:start      # Supabase local (portas 563xx), aplica as migrations
npx supabase status -o env   # copie API_URL, ANON_KEY e SERVICE_ROLE_KEY para o .env.local
npm run dev           # http://localhost:3100
```

`.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e (só para `rls:check`) `SUPABASE_SERVICE_ROLE_KEY`.

Gate antes de commitar: `npm run typecheck && npm run lint && npm test && npm run build && npm run db:test`.
Isolamento entre usuários na API real: `npm run rls:check`.

## Produção

Crie um projeto no Supabase, rode `supabase link` + `supabase db push` (ou deixe o job `migrate` do CI fazer isso) e publique na Vercel
com as duas variáveis `NEXT_PUBLIC_*`. Detalhes em `AGENTS.md` (seção Go-live).

## Como funciona

- **Resultado** = total a receber − (gastos gerais + último pit-stop de cada cartão). É um valor previsto/estimado; o status Pendente/Recebido/Pago é só controle visual.
- **Fixo**: linhas marcadas persistem no próximo mês (voltam como Pendente). Cartões persistem por padrão, sem os pit-stops.
- **Encerrar mês** (`close_month` no Postgres, em uma transação): grava o snapshot em `month_snapshots` e prepara o mês seguinte.
- Todas as tabelas têm `user_id` + Row Level Security, então o app já está pronto para mais de um usuário.
