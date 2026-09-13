-- =========================================================
-- TokBid - Migración: quitar cuentas de usuario, pujas anónimas
-- Ejecutar UNA VEZ en tu proyecto de Supabase ya existente.
-- No borra el historial de pujas.
-- =========================================================

-- 1. Los creadores guardan el NOMBRE de quien puja (texto libre),
--    en vez de un id de usuario registrado.
alter table public.creators add column if not exists current_bidder_name text;

update public.creators c
set current_bidder_name = p.username
from public.profiles p
where c.current_bidder_id = p.id
  and c.current_bidder_name is null;

-- 2. Las pujas también guardan el nombre directamente.
alter table public.bids add column if not exists bidder_name text;

update public.bids b
set bidder_name = p.username
from public.profiles p
where b.bidder_id = p.id
  and b.bidder_name is null;

update public.bids set bidder_name = 'Anónimo' where bidder_name is null;
update public.creators set current_bidder_name = 'Anónimo'
  where current_bidder_name is null and current_bidder_id is not null;

alter table public.bids alter column bidder_id drop not null;

-- 3. Función que aplica una puja YA PAGADA, con nombre libre en vez
--    de un id de usuario. Solo la ejecuta el servidor (service_role).
create or replace function public.place_bid_paid(
  p_creator_id uuid,
  p_bidder_name text,
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

  insert into public.bids (creator_id, bidder_name, amount)
  values (p_creator_id, coalesce(v_name, 'Anónimo'), p_new_total_bid)
  returning id into v_bid_id;

  update public.creators
  set current_bid = p_new_total_bid,
      current_bidder_name = coalesce(v_name, 'Anónimo'),
      updated_at = now()
  where id = p_creator_id;

  insert into public.payments
    (creator_id, amount_charged, new_total_bid, stripe_payment_intent_id, status)
  values
    (p_creator_id, p_amount_charged, p_new_total_bid, p_stripe_payment_intent_id, 'succeeded');

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

revoke all on function public.place_bid_paid(uuid, text, numeric, numeric, text) from public;
revoke all on function public.place_bid_paid(uuid, text, numeric, numeric, text) from authenticated;
revoke all on function public.place_bid_paid(uuid, text, numeric, numeric, text) from anon;

alter table public.payments alter column bidder_id drop not null;

-- 4. Vista de ranking: ya no cruza con profiles, el nombre del
--    postor vive directamente en creators. La borramos primero
--    porque cambia el conjunto de columnas (CREATE OR REPLACE VIEW
--    no permite quitar columnas, solo añadirlas al final).
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
