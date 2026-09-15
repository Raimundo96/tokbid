-- =========================================================
-- TokBid - Migración: añadir un creador por URL de TikTok
-- Ejecutar UNA VEZ. No borra nada de lo que ya tienes.
-- =========================================================

create or replace function public.get_or_create_creator(
  p_tiktok_username text,
  p_display_name text,
  p_avatar_url text,
  p_followers bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text := lower(trim(p_tiktok_username));
  v_row record;
begin
  if v_username !~ '^[a-z0-9._]{2,24}$' then
    return jsonb_build_object('success', false, 'error', 'invalid_username');
  end if;

  -- Si ya existe, no lo tocamos (mantiene su puja actual e historial).
  -- Si no existe, lo crea activo y con la puja inicial de $1.
  insert into public.creators
    (tiktok_username, display_name, avatar_url, followers, current_bid, status)
  values
    (v_username, coalesce(nullif(trim(p_display_name), ''), v_username), p_avatar_url, coalesce(p_followers, 0), 1, 'active')
  on conflict (tiktok_username) do nothing;

  select id, tiktok_username, display_name, avatar_url, followers, current_bid, current_bidder_name
  into v_row
  from public.creators
  where tiktok_username = v_username;

  return jsonb_build_object(
    'success', true,
    'id', v_row.id,
    'tiktok_username', v_row.tiktok_username,
    'display_name', v_row.display_name,
    'avatar_url', v_row.avatar_url,
    'followers', v_row.followers,
    'current_bid', v_row.current_bid,
    'current_bidder_name', v_row.current_bidder_name
  );
end;
$$;

revoke all on function public.get_or_create_creator(text, text, text, bigint) from public;
grant execute on function public.get_or_create_creator(text, text, text, bigint) to anon, authenticated;
