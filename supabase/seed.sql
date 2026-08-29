-- =========================================================
-- TokBid - Datos de prueba (seed/demo)
-- Ejecutar después de schema.sql
-- =========================================================

insert into public.categories (code, label, flag_emoji, sort_order) values
  ('global', 'Global', '🌎', 0),
  ('es', 'España', '🇪🇸', 1),
  ('mx', 'México', '🇲🇽', 2),
  ('ar', 'Argentina', '🇦🇷', 3),
  ('gq', 'Guinea Ecuatorial', '🇬🇶', 4),
  ('ng', 'Nigeria', '🇳🇬', 5)
on conflict (code) do nothing;

insert into public.creators
  (tiktok_username, display_name, country, avatar_url, followers, current_bid, status)
values
  ('creator_a', 'Creator A', 'es', 'https://i.pravatar.cc/200?img=11', 12500000, 500, 'active'),
  ('creator_b', 'Creator B', 'mx', 'https://i.pravatar.cc/200?img=22', 8900000,  420, 'active'),
  ('creator_c', 'Creator C', 'ar', 'https://i.pravatar.cc/200?img=33', 6100000,  300, 'active'),
  ('creator_d', 'Creator D', 'ng', 'https://i.pravatar.cc/200?img=44', 3400000,  150, 'active'),
  ('creator_e', 'Creator E', 'gq', 'https://i.pravatar.cc/200?img=55', 1200000,   50, 'active')
on conflict (tiktok_username) do nothing;

-- Nota: las filas de "bids" y "battles" se generan orgánicamente a través de la
-- función place_bid(), no se insertan pujas de prueba directamente aquí para no
-- romper la integridad del historial (bidder_id debe referenciar un auth.users real).
