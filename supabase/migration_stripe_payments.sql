-- =========================================================
-- TokBid - Migración: pagos reales con Stripe
-- Ejecutar UNA VEZ. No borra nada de lo que ya tienes.
-- =========================================================

-- 1. Ledger de pagos: un registro permanente de cada cobro real
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (id) on delete cascade,
  bidder_id uuid not null references auth.users (id) on delete cascade,
  amount_charged numeric not null,   -- lo que se COBRÓ de verdad (la diferencia)
  new_total_bid numeric not null,    -- el nuevo total que queda como "puja actual"
  stripe_payment_intent_id text unique not null,
  status text not null default 'succeeded',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = bidder_id);

-- No hay policy de INSERT: los pagos solo se registran desde el
-- webhook de Stripe (con la service_role key, que evita RLS).

-- 2. Registro de eventos de Stripe ya procesados (evita procesar el
--    mismo webhook dos veces si Stripe lo reintenta)
create table if not exists public.stripe_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- Sin policies: solo accesible con la service_role key (el webhook).

-- 3. Función que aplica una puja YA PAGADA. Solo la puede ejecutar
--    el servidor (service_role), nunca el cliente directamente,
--    porque no depende de auth.uid() sino de un parámetro explícito
--    que solo nuestro propio webhook rellena tras confirmar el cobro.
create or replace function public.place_bid_paid(
  p_creator_id uuid,
  p_bidder_id uuid,
  p_amount_charged numeric,
  p_new_total_bid numeric,
  p_stripe_payment_intent_id text
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

  insert into public.bids (creator_id, bidder_id, amount)
  values (p_creator_id, p_bidder_id, p_new_total_bid)
  returning id into v_bid_id;

  update public.creators
  set current_bid = p_new_total_bid,
      current_bidder_id = p_bidder_id,
      updated_at = now()
  where id = p_creator_id;

  insert into public.payments
    (creator_id, bidder_id, amount_charged, new_total_bid, stripe_payment_intent_id, status)
  values
    (p_creator_id, p_bidder_id, p_amount_charged, p_new_total_bid, p_stripe_payment_intent_id, 'succeeded');

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

  return jsonb_build_object('success', true, 'creator_id', p_creator_id, 'new_bid', p_new_total_bid);
end;
$$;

-- CRÍTICO: nadie desde el cliente puede llamar a esta función.
-- Solo el servidor (con la service_role key) puede ejecutarla.
revoke all on function public.place_bid_paid(uuid, uuid, numeric, numeric, text) from public;
revoke all on function public.place_bid_paid(uuid, uuid, numeric, numeric, text) from authenticated;
revoke all on function public.place_bid_paid(uuid, uuid, numeric, numeric, text) from anon;
