-- Controle Financeiro — schema inicial (idempotente; roda em produção via CI).

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists income_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null default '',
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'done')),
  persist boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists expense_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  description text not null default '',
  amount numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'done')),
  category_id uuid references categories(id) on delete set null,
  persist boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  persist boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists card_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  card_id uuid not null references cards(id) on delete cascade,
  seq int not null,
  date date not null default current_date,
  amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (card_id, seq)
);

create table if not exists month_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reference text not null check (reference ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  closed_at timestamptz not null default now(),
  data jsonb not null,
  unique (user_id, reference)
);

-- Row Level Security: cada usuário só enxerga e altera o que é dele.
do $$
declare t text;
begin
  foreach t in array array[
    'categories', 'income_items', 'expense_items',
    'cards', 'card_checkpoints', 'month_snapshots'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows" on %I', t);
    execute format(
      'create policy "own rows" on %I for all
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- Encerra o mês numa única transação: grava o snapshot e prepara o próximo mês.
create or replace function close_month(p_reference text)
returns uuid
language plpgsql
as $$
declare
  v_user uuid := auth.uid();
  v_income numeric;
  v_general numeric;
  v_cards numeric;
  v_data jsonb;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Não autenticado';
  end if;

  select coalesce(sum(amount), 0) into v_income
    from income_items where user_id = v_user;
  select coalesce(sum(amount), 0) into v_general
    from expense_items where user_id = v_user;
  -- Cada fatura conta apenas o último pit-stop.
  select coalesce(sum(last_amount), 0) into v_cards from (
    select (select cp.amount from card_checkpoints cp
             where cp.card_id = c.id order by cp.seq desc limit 1) as last_amount
      from cards c where c.user_id = v_user
  ) x;

  v_data := jsonb_build_object(
    'totals', jsonb_build_object(
      'income', v_income,
      'expenseGeneral', v_general,
      'expenseCards', v_cards,
      'expenseTotal', v_general + v_cards,
      'result', v_income - v_general - v_cards
    ),
    'income', coalesce((
      select jsonb_agg(jsonb_build_object(
        'description', i.description, 'amount', i.amount,
        'status', i.status, 'persist', i.persist) order by i.created_at)
      from income_items i where i.user_id = v_user), '[]'::jsonb),
    'expenses', coalesce((
      select jsonb_agg(jsonb_build_object(
        'description', e.description, 'amount', e.amount,
        'status', e.status, 'persist', e.persist,
        'category', cat.name) order by e.created_at)
      from expense_items e
      left join categories cat on cat.id = e.category_id
      where e.user_id = v_user), '[]'::jsonb),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', c.name, 'status', c.status, 'persist', c.persist,
        'checkpoints', coalesce((
          select jsonb_agg(jsonb_build_object(
            'seq', cp.seq, 'date', cp.date, 'amount', cp.amount) order by cp.seq)
          from card_checkpoints cp where cp.card_id = c.id), '[]'::jsonb)
      ) order by c.created_at)
      from cards c where c.user_id = v_user), '[]'::jsonb)
  );

  insert into month_snapshots (user_id, reference, data)
    values (v_user, p_reference, v_data)
    returning id into v_id;

  -- Prepara o próximo mês.
  delete from income_items  where user_id = v_user and not persist;
  update income_items       set status = 'pending' where user_id = v_user;
  delete from expense_items where user_id = v_user and not persist;
  update expense_items      set status = 'pending' where user_id = v_user;
  delete from card_checkpoints where user_id = v_user;
  delete from cards         where user_id = v_user and not persist;
  update cards              set status = 'pending' where user_id = v_user;

  return v_id;
end;
$$;

-- Só usuários logados chamam a função (ela também recusa auth.uid() nulo).
revoke execute on function close_month(text) from public, anon;
grant execute on function close_month(text) to authenticated;
