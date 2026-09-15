-- =========================================================
-- TokBid — Lógica de puja completa (Paddle + ranking)
-- Ejecutar UNA VEZ en el SQL Editor de Supabase.
-- =========================================================

-- 1) Idempotencia de webhooks Paddle
create table if not exists public.paddle_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

-- 2) Columnas extra en payments / bids
alter table public.payments
  add column if not exists creator_share numeric,
  add column if not exists platform_share numeric,
  add column if not exists message text,
  add column if not exists payment_provider text default 'paddle';

alter table public.bids
  add column if not exists message text;

alter table public.creators
  add column if not exists current_bidder_name text;

-- 3) Función central: aplica una puja YA PAGADA
--    Reglas:
--    - Solo sube si new_total > current_bid
--    - Guarda nombre del pujador (sin cuenta)
--    - TokBid 100% (creator_share = 0)
--    - Registra batalla si quita el #1 a alguien
create or replace function public.place_bid_paid_v2(
  p_creator_id uuid,
  p_bidder_name text,
  p_amount_charged numeric,
  p_new_total_bid numeric,
  p_payment_id text,
  p_creator_share numeric,
  p_platform_share numeric,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_creator record;
  v_previous_top record;
  v_bid_id uuid;
  v_name text := nullif(trim(p_bidder_name), '');
begin
  if p_amount_charged is null or p_amount_charged <= 0 then
    return jsonb_build_object('success', false, 'error', 'invalid_amount');
  end if;

  if p_payment_id is null or length(trim(p_payment_id)) = 0 then
    return jsonb_build_object('success', false, 'error', 'missing_payment_id');
  end if;

  -- Evitar aplicar dos veces el mismo pago (por payment id)
  if exists (
    select 1 from public.payments
    where stripe_payment_intent_id = p_payment_id
  ) then
    return jsonb_build_object('success', true, 'duplicate', true, 'payment_id', p_payment_id);
  end if;

  select * into v_creator
  from public.creators
  where id = p_creator_id and status = 'active'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'creator_not_found');
  end if;

  if p_new_total_bid <= v_creator.current_bid then
    return jsonb_build_object(
      'success', false,
      'error', 'bid_too_low',
      'current_bid', v_creator.current_bid,
      'attempted', p_new_total_bid
    );
  end if;

  -- Insertar puja
  insert into public.bids (creator_id, bidder_name, amount, message)
  values (
    p_creator_id,
    coalesce(v_name, 'Anónimo'),
    p_new_total_bid,
    nullif(trim(p_message), '')
  )
  returning id into v_bid_id;

  -- Actualizar ranking del creador
  update public.creators
  set current_bid = p_new_total_bid,
      current_bidder_name = coalesce(v_name, 'Anónimo'),
      updated_at = now()
  where id = p_creator_id;

  -- Registrar pago (TokBid 100%)
  insert into public.payments (
    creator_id,
    amount_charged,
    new_total_bid,
    stripe_payment_intent_id,
    status,
    creator_share,
    platform_share,
    message,
    payment_provider
  )
  values (
    p_creator_id,
    p_amount_charged,
    p_new_total_bid,
    p_payment_id,
    'succeeded',
    coalesce(p_creator_share, 0),
    coalesce(p_platform_share, p_amount_charged),
    nullif(trim(p_message), ''),
    'paddle'
  );

  -- Batalla: si supera a quien estaba por encima
  select id into v_previous_top
  from public.creators c3
  where c3.status = 'active'
    and c3.id <> p_creator_id
    and c3.current_bid > v_creator.current_bid
    and c3.current_bid <= p_new_total_bid
  order by c3.current_bid asc
  limit 1;

  if v_previous_top.id is not null then
    insert into public.battles (winner_creator_id, previous_creator_id, bid_id)
    values (p_creator_id, v_previous_top.id, v_bid_id);
  end if;

  return jsonb_build_object(
    'success', true,
    'creator_id', p_creator_id,
    'new_bid', p_new_total_bid,
    'bidder_name', coalesce(v_name, 'Anónimo'),
    'amount_charged', p_amount_charged,
    'bid_id', v_bid_id
  );
end;
$$;

revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from public;
revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from authenticated;
revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from anon;

-- 4) Vista de ranking (por si falta current_bidder_name)
drop view if exists public.ranking_view;

create view public.ranking_view as
select
  c.id,
  c.tiktok_username,
  c.display_name,
  c.country,
  c.avatar_url,
  c.followers,
  c.current_bid,
  (c.current_bid + 1) as beat_by,
  row_number() over (order by c.current_bid desc, c.created_at asc) as position,
  c.current_bidder_name
from public.creators c
where c.status = 'active';

grant select on public.ranking_view to anon, authenticated;
