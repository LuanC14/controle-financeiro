begin;
select plan(17);

-- Dois usuários.
insert into auth.users (id, instance_id, aud, role, email)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@test.dev'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test.dev');

-- ===== Usuário A cadastra dados =====
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);

insert into categories (id, name) values ('c0000000-0000-0000-0000-000000000001', 'Moradia');
insert into income_items (description, amount, status, persist) values
  ('Salário', 1000, 'done', true),
  ('Pix avulso', 500, 'pending', false);
insert into expense_items (description, amount, status, persist, category_id) values
  ('Aluguel', 200, 'done', true, 'c0000000-0000-0000-0000-000000000001'),
  ('Boleto único', 50, 'pending', false, null);
insert into cards (id, name, status) values ('d0000000-0000-0000-0000-000000000001', 'PicPay', 'done');
insert into card_checkpoints (card_id, seq, amount) values
  ('d0000000-0000-0000-0000-000000000001', 1, 250),
  ('d0000000-0000-0000-0000-000000000001', 2, 450);

select is((select count(*)::int from income_items), 2, 'A vê as próprias receitas');

-- ===== Isolamento: B não enxerga nem altera nada de A =====
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","role":"authenticated"}', true);

select is((select count(*)::int from income_items), 0, 'B não vê receitas de A');
select is((select count(*)::int from expense_items), 0, 'B não vê gastos de A');
select is((select count(*)::int from cards), 0, 'B não vê cartões de A');
select is((select count(*)::int from card_checkpoints), 0, 'B não vê pit-stops de A');
select is((select count(*)::int from categories), 0, 'B não vê categorias de A');

select throws_ok(
  $$insert into income_items (user_id, description, amount) values ('aaaaaaaa-0000-0000-0000-000000000001', 'forjado', 1)$$,
  '42501', null, 'B não consegue gravar linha em nome de A');

update income_items set amount = 0;
delete from cards;

-- ===== A encerra o mês =====
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}', true);

select is((select count(*)::int from cards), 1, 'update/delete de B não afetaram A');
select is((select sum(amount) from income_items), 1500::numeric, 'receitas de A intactas após ataque de B');

select lives_ok($$select close_month('2026-10')$$, 'A encerra o mês');

select is(
  (select data->'totals' from month_snapshots where reference = '2026-10'),
  '{"income": 1500, "expenseGeneral": 250, "expenseCards": 450, "expenseTotal": 700, "result": 800}'::jsonb,
  'totais do snapshot: cartão conta só o último pit-stop');

select is(
  (select jsonb_array_length(data->'income') from month_snapshots where reference = '2026-10'),
  2, 'snapshot guarda também os itens pendentes');

select is(
  (select jsonb_array_length(data->'cards'->0->'checkpoints') from month_snapshots where reference = '2026-10'),
  2, 'snapshot guarda todos os pit-stops');

select results_eq(
  $$select description, status from income_items$$,
  $$values ('Salário'::text, 'pending'::text)$$,
  'só a linha fixa permanece, voltando para Pendente');

select results_eq(
  $$select name, status from cards$$,
  $$values ('PicPay'::text, 'pending'::text)$$,
  'cartão permanece, voltando para Pendente');

select is((select count(*)::int from card_checkpoints), 0, 'pit-stops são zerados');

select throws_ok($$select close_month('2026-10')$$, '23505', null, 'não encerra o mesmo mês duas vezes');

select * from finish();
rollback;
