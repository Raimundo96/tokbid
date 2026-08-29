-- =========================================================
-- TokBid - Migración: añadir nombre de usuario público
-- Ejecutar UNA VEZ en un proyecto que ya tiene datos (no borra nada)
-- =========================================================

-- 1. Añadir la columna username a profiles (si no existe ya)
alter table public.profiles add column if not exists username text;

-- 2. Nombre de usuario único (ignorando mayúsculas/minúsculas), permite null
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

-- 3. Vista pública: expone solo id + username, nunca el email
create or replace view public.public_profiles as
  select id, username
  from public.profiles
  where username is not null;

grant select on public.public_profiles to anon, authenticated;
