-- =========================================================
-- TokBid - Migración: aprobación automática de creadores
-- Los creadores enviados con submit_creator() pasan a "active"
-- directamente, sin revisión manual. Ejecutar UNA VEZ.
-- =========================================================

create or replace function public.submit_creator(
  p_tiktok_username text,
  p_display_name text,
  p_country text,
  p_avatar_url text,
  p_followers bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_username text := lower(trim(p_tiktok_username));
  v_display_name text := trim(p_display_name);
  v_owned_count int;
  v_creator_id uuid;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'not_authenticated');
  end if;

  if v_username !~ '^[a-z0-9._]{2,24}$' then
    return jsonb_build_object('success', false, 'error', 'invalid_username');
  end if;

  if v_display_name = '' or v_display_name is null then
    return jsonb_build_object('success', false, 'error', 'invalid_display_name');
  end if;

  -- Límite anti-spam: máximo 5 creadores por usuario en total
  select count(*) into v_owned_count
  from public.creators
  where owner_id = v_uid;

  if v_owned_count >= 5 then
    return jsonb_build_object('success', false, 'error', 'too_many_creators');
  end if;

  begin
    insert into public.creators
      (owner_id, tiktok_username, display_name, country, avatar_url, followers, current_bid, status)
    values
      (v_uid, v_username, v_display_name, p_country, nullif(p_avatar_url, ''), coalesce(p_followers, 0), 1, 'active')
    returning id into v_creator_id;
  exception
    when unique_violation then
      return jsonb_build_object('success', false, 'error', 'username_taken');
  end;

  return jsonb_build_object('success', true, 'creator_id', v_creator_id);
end;
$$;

revoke all on function public.submit_creator(text, text, text, text, bigint) from public;
grant execute on function public.submit_creator(text, text, text, text, bigint) to authenticated;
