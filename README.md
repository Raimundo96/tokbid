# TokBid 👑

Plataforma de ranking y pujas de creadores de TikTok. Los creadores se ordenan por su puja
actual (no por seguidores), y cualquier usuario registrado puede pujar para intentar colocar
a su creador favorito en el #1.

**Esta versión no procesa dinero real.** Las pujas se guardan en Supabase como operaciones
de prueba. Stripe y los pagos reales se añadirán en una fase posterior.

## Stack

- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Row Level Security + Realtime)

## Estructura del proyecto

```
app/
  page.tsx              → Home (hero, podio, panel de puja, ranking, actividad)
  login/                → Inicio de sesión
  register/             → Registro
  creator/[username]/   → Perfil de creador + historial de pujas
  battles/               → Batallas activas
  records/                → Récords calculados desde Supabase
components/              → Navbar, Hero, Podium, Ranking, BidPanel, CreatorCard,
                            BattleCard, ActivityFeed, Records, ShareButton
lib/
  supabase/               → Clientes de Supabase (browser y server)
  types/                  → Tipos TypeScript compartidos
  utils/                  → Formateo (dinero, seguidores, fechas)
supabase/
  schema.sql              → Tablas, RLS, función RPC place_bid()
  seed.sql                → Datos de demo (5 creadores + categorías)
```

## 1. Crear el proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Guarda la contraseña de la base de datos en un lugar seguro.
3. Espera a que el proyecto termine de aprovisionarse.

## 2. Ejecutar el SQL

1. Abre **SQL Editor** en el panel de Supabase.
2. Pega el contenido de `supabase/schema.sql` y ejecútalo.
3. Pega el contenido de `supabase/seed.sql` y ejecútalo (crea 5 creadores de demo y las
   categorías de país).

Esto crea las tablas `profiles`, `creators`, `bids`, `battles`, `categories`, la vista
`ranking_view` y la función `place_bid()`, todas con Row Level Security activada.

## 3. Configurar las variables de entorno

1. Copia `.env.example` a `.env.local`.
2. En Supabase, ve a **Project Settings → API** y copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Nunca** copies la `service_role key` aquí: esa clave nunca debe estar en el frontend.

## 4. Instalar dependencias

```bash
npm install
```

## 5. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Para producción:

```bash
npm run build
npm run start
```

## 6. Crear el primer usuario

1. Ve a `/register` en la app y crea una cuenta con email + contraseña.
2. Supabase enviará un email de confirmación (según la configuración de tu proyecto,
   puedes desactivar la confirmación por email en **Authentication → Providers → Email**
   mientras desarrollas).
3. Inicia sesión en `/login`.

## 7. Probar una puja

1. Con sesión iniciada, ve a la Home o al perfil de un creador (p. ej. `/creator/creator_a`).
2. En el panel **¡Supera al #1!**, ajusta el importe (debe ser mayor que la puja actual)
   e introduce tu puja.
3. Pulsa **🚀 Pujar y ser #1**.
4. La puja se procesa mediante la función `place_bid()` en Postgres, que:
   - bloquea la fila del creador (`FOR UPDATE`) para evitar condiciones de carrera,
   - verifica que superas la puja actual,
   - guarda la puja en `bids`,
   - actualiza `creators.current_bid`,
   - y registra una `battle` si la puja provoca un cambio relevante en el TOP 3.
5. El ranking, el podio y la actividad reciente se actualizan solos vía Supabase Realtime.

## Seguridad

- Toda la lógica crítica de pujas vive en la función SQL `place_bid()` (`security definer`),
  nunca en el cliente.
- El cliente no puede escribir directamente en `creators.current_bid` ni en `bids`: no
  existen policies de `INSERT`/`UPDATE` para esas tablas desde el rol `authenticated`.
- RLS está activo en todas las tablas. El público solo puede leer creadores con
  `status = 'active'`.
- El frontend solo usa la clave `anon`/publishable. La `service_role key` no se usa en
  ningún archivo del proyecto.

## Próxima fase (no incluida todavía)

- Integración de Stripe Checkout + webhooks para pujas con dinero real.
- Idempotencia y confirmación de pago antes de actualizar `current_bid`.
- Ledger de transacciones y protección contra fraude.
