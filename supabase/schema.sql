-- =========================================================
-- TokBid - Esquema de base de datos
-- Ejecutar completo en el SQL editor de Supabase (o via CLI)
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Un usuario solo puede leer/actualizar su propio perfil
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 2. CATEGORIES (preparado para filtros por país / global)
-- ---------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,       -- 'global', 'es', 'mx', 'ar', 'gq', 'ng'...
  label text not null,             -- 'Global', 'España', 'México'...
  flag_emoji text,
  sort_order int not null default 0
);

alter table public.categories enable row level security;

create policy "categories_select_all"
  on public.categories for select
  using (true);

-- ---------------------------------------------------------
-- 3. CREATORS
-- ---------------------------------------------------------
create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete set null,
  tiktok_username text unique not null,
  display_name text not null,
  country text,               -- código de categoría (referencia informal a categories.code)
  avatar_url text,
  followers bigint not null default 0,
  current_bid numeric not null default 0,
  status text not null default 'pending'
    check (status in ('active', 'pending', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creators_current_bid_idx
  on public.creators (current_bid desc)
  where status = 'active';

create index if not exists creators_status_idx on public.creators (status);
create index if not exists creators_country_idx on public.creators (country);

alter table public.creators enable row level security;

-- El público solo puede leer creadores activos
create policy "creators_select_active"
  on public.creators for select
  using (status = 'active');

-- El dueño de un creador (si aplica) puede ver también su propia fila aunque no esté activa
create policy "creators_select_own"
  on public.creators for select
  using (auth.uid() = owner_id);

-- IMPORTANTE: no se exponen policies de INSERT/UPDATE/DELETE directas para el cliente.
-- Toda escritura de current_bid pasa exclusivamente por la función place_bid() (security definer).
-- Cualquier gestión de alta/edición de creadores se hace desde el panel de administración
-- (service_role, fuera del cliente) en esta fase del proyecto.

-- ---------------------------------------------------------
-- 4. BIDS (historial inmutable de pujas)
-- ---------------------------------------------------------
create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators (id) on delete cascade,
  bidder_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists bids_creator_idx on public.bids (creator_id, created_at desc);
create index if not exists bids_bidder_idx on public.bids (bidder_id, created_at desc);

alter table public.bids enable row level security;

-- Cualquiera puede leer el historial de pujas de creadores activos (transparencia del ranking)
create policy "bids_select_public"
  on public.bids for select
  using (
    exists (
      select 1 from public.creators c
      where c.id = bids.creator_id and c.status = 'active'
    )
  );

-- No hay policy de INSERT para bids: se crean únicamente dentro de place_bid() (security definer),
-- nunca directamente desde el cliente.

-- ---------------------------------------------------------
-- 5. BATTLES (eventos relevantes de cambio de posición)
-- ---------------------------------------------------------
create table if not exists public.battles (
  id uuid primary key default gen_random_uuid(),
  winner_creator_id uuid not null references public.creators (id) on delete cascade,
  previous_creator_id uuid references public.creators (id) on delete set null,
  bid_id uuid references public.bids (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists battles_created_idx on public.battles (created_at desc);

alter table public.battles enable row level security;

create policy "battles_select_public"
  on public.battles for select
  using (true);

-- No hay policy de INSERT: las batallas se registran solo dentro de place_bid().

-- ---------------------------------------------------------
-- 6. FUNCION RPC: place_bid()
-- ---------------------------------------------------------
-- Ejecuta la puja de forma atómica:
--   1. Verifica autenticación
--   2. Verifica importe > 0
--   3. Bloquea la fila del creador (FOR UPDATE)
--   4. Verifica que la nueva puja supera la actual
--   5. Inserta en bids
--   6. Actualiza creators.current_bid
--   7. Si corresponde, registra una battle (cambio en el TOP 3)
--   8. Devuelve el resultado
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
  v_was_top3 boolean;
begin
  if v_uid is null then
    return jsonb_build_object('success', false, 'error', 'not_authenticated');
  end if;

  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'invalid_amount');
  end if;

  -- Bloquea la fila del creador para evitar condiciones de carrera
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

  -- ¿Este creador ya estaba en el TOP 3 antes de la puja?
  select count(*) < 3 into v_was_top3
  from public.creators c2
  where c2.status = 'active'
    and c2.current_bid > v_creator.current_bid;

  -- Registrar la puja (historial inmutable)
  insert into public.bids (creator_id, bidder_id, amount)
  values (p_creator_id, v_uid, p_amount)
  returning id into v_bid_id;

  -- Actualizar el creador
  update public.creators
  set current_bid = p_amount,
      updated_at = now()
  where id = p_creator_id;

  -- Si la nueva puja lo coloca en el TOP 3 (o lo mantiene ahí y adelanta a alguien),
  -- registrar una batalla contra quien ocupaba la posición inmediatamente superior antes de la puja.
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

-- Solo usuarios autenticados pueden ejecutar la función
revoke all on function public.place_bid(uuid, numeric) from public;
grant execute on function public.place_bid(uuid, numeric) to authenticated;

-- ---------------------------------------------------------
-- 7. VISTA: ranking con "importe para superar"
-- ---------------------------------------------------------
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
  row_number() over (order by c.current_bid desc, c.created_at asc) as position
from public.creators c
where c.status = 'active';

grant select on public.ranking_view to anon, authenticated;
