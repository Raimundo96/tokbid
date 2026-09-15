-- =========================================================
-- TokBid - Migración Paddle
-- Ejecutar UNA VEZ en el SQL Editor de Supabase.
-- =========================================================

-- 1. Tabla de idempotencia para webhooks de Paddle
create table if not exists public.paddle_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

-- 2. Columnas de split / proveedor (si aún no existen)
alter table public.payments
  add column if not exists creator_share numeric,
  add column if not exists platform_share numeric,
  add column if not exists message text,
  add column if not exists payment_provider text default 'paddle';

alter table public.bids
  add column if not exists message text;

-- 3. Función de puja pagada (TokBid 100% / creador 0%)
--    Los parámetros de share se guardan tal cual llegan del webhook.
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
  select * into v_creator
  from public.creators
  where id = p_creator_id and status = 'active'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'creator_not_found');
  end if;

  if p_new_total_bid <= v_creator.current_bid then
    return jsonb_build_object('success', false, 'error', 'bid_too_low');
  end if;

  insert into public.bids (creator_id, bidder_name, amount, message)
  values (p_creator_id, coalesce(v_name, 'Anónimo'), p_new_total_bid, nullif(trim(p_message), ''))
  returning id into v_bid_id;

  update public.creators
  set current_bid = p_new_total_bid,
      current_bidder_name = coalesce(v_name, 'Anónimo'),
      updated_at = now()
  where id = p_creator_id;

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
    p_creator_share,
    p_platform_share,
    nullif(trim(p_message), ''),
    'paddle'
  );

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
    'creator_share', p_creator_share,
    'platform_share', p_platform_share
  );
end;
$$;

revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from public;
revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from authenticated;
revoke all on function public.place_bid_paid_v2(uuid, text, numeric, numeric, text, numeric, numeric, text) from anon;
