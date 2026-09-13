# TokBid 👑

Ranking público donde cualquiera puede pujar dinero real (solo con un nombre, sin cuenta ni
registro) para colocar un perfil de TikTok en una posición más alta.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Realtime), sin autenticación de usuarios
- Stripe (pagos reales, cobra solo la diferencia para superar la puja actual)

## Estructura
```
app/
  page.tsx                    → Página única: hero, podio, ranking + puja
  terms/, privacy/            → Legal
  api/stripe/checkout/        → Crea la sesión de pago
  api/stripe/webhook/         → Confirma el pago y aplica la puja
components/
  Navbar, Hero, Podium, Ranking, BidPanel
lib/
  supabase/ (client.ts navegador, admin.ts solo servidor), stripe.ts, types/, utils/
supabase/
  schema.sql, seed.sql, migration_*.sql
```

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_SITE_URL=
```

## Seguridad
- Ninguna puja se aplica hasta que Stripe confirma el pago vía webhook.
- La función `place_bid_paid()` solo la puede ejecutar el servidor (service_role key).
- El cliente nunca puede escribir directamente en `creators.current_bid`.
