-- Limite de contas: sem confirmação de e-mail, o cadastro é aberto; o teto evita poluir o banco.
-- Para mudar o limite, crie uma nova migration redefinindo account_limit().

create or replace function public.account_limit()
returns int
language sql
immutable
as $$ select 10 $$;

-- Verdadeiro enquanto ainda há vaga. O app consulta antes de cadastrar, para dar uma mensagem clara.
create or replace function public.signup_open()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select (select count(*) from auth.users) < public.account_limit() $$;

revoke execute on function public.signup_open() from public;
grant execute on function public.signup_open() to anon, authenticated;

-- Guarda real: vale para qualquer caminho de criação (API pública, admin, SQL).
create or replace function public.enforce_account_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serializa cadastros simultâneos para não passar do teto.
  perform pg_advisory_xact_lock(hashtext('account_limit'));
  if (select count(*) from auth.users) >= public.account_limit() then
    raise exception 'account_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_account_limit on auth.users;
create trigger enforce_account_limit
  before insert on auth.users
  for each row execute function public.enforce_account_limit();
