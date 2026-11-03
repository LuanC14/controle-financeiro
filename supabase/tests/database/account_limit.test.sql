begin;
select plan(5);

-- Parte de um banco vazio (tudo é desfeito no rollback).
delete from auth.users;

select is(public.signup_open(), true, 'cadastro aberto sem contas');

insert into auth.users (id, instance_id, aud, role, email)
select gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'u' || n || '@test.dev'
from generate_series(1, 10) n;

select is((select count(*)::int from auth.users), 10, 'aceita até o limite');
select is(public.signup_open(), false, 'cadastro fechado ao atingir o limite');

select throws_ok(
  $$insert into auth.users (id, instance_id, aud, role, email)
    values (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'extra@test.dev')$$,
  'P0001', 'account_limit_reached', 'a conta 11 é recusada');

select is((select count(*)::int from auth.users), 10, 'nenhuma conta extra foi criada');

select * from finish();
rollback;
