-- =========================================================
-- TokBid - Migración: mostrar quién es el postor actual
-- Ejecutar UNA VEZ en un proyecto que ya tiene datos (no borra nada)
-- Requiere haber ejecutado antes migration_username.sql
-- =========================================================

alter table public.creators
  add column if not exists current_bidder_id uuid references public.profiles (id);

create or replace function public.place_bid(
  p_creator_id uuid,
  p_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_creator record;
  v_previous_top record;
  v_bid_id uuid;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'not_authenticated');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'invalid_amount');
  end if;

  select * into v_creator
  from public.creators
  where id = p_creator_id and status = 'active'
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'creator_not_found');
  end if;

  if p_amount <= v_creator.current_bid then
    return jsonb_build_object(
      'success', false,
      'error', 'bid_too_low',
      'current_bid', v_creator.current_bid,
      'minimum_required', v_creator.current_bid + 1
    );
  end if;

  insert into public.bids (creator_id, bidder_id, amount)
  values (p_creator_id, v_uid, p_amount)
  returning id into v_bid_id;

  update public.creators
  set current_bid = p_amount,
      current_bidder_id = v_uid,
      updated_at = now()
  where id = p_creator_id;

  select id into v_previous_top
  from public.creators c3
  where c3.status = 'active'
    and c3.id <> p_creator_id
    and c3.current_bid > v_creator.current_bid
    and c3.current_bid <= p_amount
  order by c3.current_bid asc
  limit 1;

  if v_previous_top.id is not null then
    insert into public.battles (winner_creator_id, previous_creator_id, bid_id)
    values (p_creator_id, v_previous_top.id, v_bid_id);
  end if;

  return jsonb_build_object(
    'success', true,
    'creator_id', p_creator_id,
    'new_bid', p_amount,
    'bid_id', v_bid_id
  );
end;
$$;

revoke all on function public.place_bid(uuid, numeric) from public;
grant execute on function public.place_bid(uuid, numeric) to authenticated;

create or replace view public.ranking_view as
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
  c.current_bidder_id,
  p.username as current_bidder_username
from public.creators c
left join public.profiles p on p.id = c.current_bidder_id
where c.status = 'active';

grant select on public.ranking_view to anon, authenticated;files p on p.id = c.current_bidder_id
where c.status = 'active';

grant select on public.ranking_view to anon, authenticated;
