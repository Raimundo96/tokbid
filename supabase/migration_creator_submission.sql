-- =========================================================
-- TokBid - Migración: permitir que cualquier usuario añada
-- su propio creador al ranking (queda "pending" hasta aprobarlo)
-- Ejecutar UNA VEZ. No borra nada de lo que ya tienes.
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
  v_pending_count int;
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

  -- Límite anti-spam: máximo 3 creadores pendientes de aprobación por usuario
  select count(*) into v_pending_count
  from public.creators
  where owner_id = v_uid and status = 'pending';

  if v_pending_count >= 3 then
    return jsonb_build_object('success', false, 'error', 'too_many_pending');
  end if;

  begin
    insert into public.creators
      (owner_id, tiktok_username, display_name, country, avatar_url, followers, current_bid, status)
    values
      (v_uid, v_username, v_display_name, p_country, nullif(p_avatar_url, ''), coalesce(p_followers, 0), 1, 'pending')
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
