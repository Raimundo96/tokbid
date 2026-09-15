# TokBid + Paddle — Instrucciones de instalación

## 1. Copia los archivos a tu proyecto

```
lib/paddle.ts                          → lib/paddle.ts
app/api/paddle/checkout/route.ts       → app/api/paddle/checkout/route.ts
app/api/paddle/webhook/route.ts        → app/api/paddle/webhook/route.ts
components/BidPanel.tsx                → components/BidPanel.tsx  (reemplaza el actual)
supabase/migration_paddle.sql         → ejecuta en Supabase
.env.example                           → actualiza tu .env.local / Vercel
```

Puedes **borrar** (o dejar sin usar) las carpetas de Stripe:
- `app/api/stripe/`
- `lib/stripe.ts`

## 2. Variables de entorno (Vercel + .env.local)

```env
PADDLE_ENV=sandbox
PADDLE_API_KEY=pdl_sdbx_apikey_...
PADDLE_PRODUCT_ID=pro_01m2gt5fdxpvecrn16bmzkspt8
PADDLE_WEBHOOK_SECRET=el_secret_del_webhook
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=test_...
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_SITE_URL=https://tokbid.lol
```

Cuando pases a producción:
- `PADDLE_ENV=live`
- `NEXT_PUBLIC_PADDLE_ENV=live`
- Usa las claves **live** (no sandbox)

## 3. SQL en Supabase

Abre el SQL Editor y ejecuta el contenido de `supabase/migration_paddle.sql`.

## 4. Paddle Dashboard (ya hecho en parte)

- [x] Product ID: `pro_01m2gt5fdxpvecrn16bmzkspt8`
- [x] Webhook URL: `https://tokbid.lol/api/paddle/webhook`
- [ ] Marca el evento **transaction.completed**
- [ ] Copia el **Endpoint secret** → `PADDLE_WEBHOOK_SECRET`
- [ ] Checkout → Default payment link = `https://tokbid.lol`

## 5. Probar

1. Deploy en Vercel con las variables
2. Entra en TokBid, elige un creador, pon nombre e importe
3. Se abre el overlay de Paddle (Sandbox)
4. Usa una tarjeta de prueba de Paddle
5. Al pagar, el webhook actualiza el ranking

### Tarjetas de prueba Paddle (Sandbox)
Consulta en el dashboard de Paddle → Developers → Test cards  
Suele funcionar algo como: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

## Flujo técnico

```
BidPanel → POST /api/paddle/checkout
         → Paddle crea Transaction (precio = diferencia)
         → Paddle.Checkout.open({ transactionId })
         → Usuario paga
         → Webhook transaction.completed
         → place_bid_paid_v2 (100% TokBid)
         → Ranking actualizado
```
