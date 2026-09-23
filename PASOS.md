# TokBid — Quitar Stripe y usar solo Paddle (Live)

## Problema
En producción el panel dice "Pago seguro con Stripe" y abre Stripe sandbox.
Hay que sustituir BidPanel y asegurar las rutas de Paddle.

## Archivos a copiar (reemplazar / crear)

```
components/BidPanel.tsx          ← REEMPLAZAR (ya no llama a Stripe)
lib/paddle.ts                    ← crear/reemplazar
lib/applyBid.ts                  ← crear
app/api/paddle/checkout/route.ts ← crear
app/api/paddle/confirm/route.ts  ← crear
app/api/paddle/webhook/route.ts  ← crear
```

## Opcional: ignorar Stripe
No borres las carpetas stripe si no quieres; simplemente BidPanel ya no las usa.
Si quieres evitar confusiones, no llames nunca a /api/stripe/checkout.

## Variables Vercel (Production) — Live

```
PADDLE_ENV=live
NEXT_PUBLIC_PADDLE_ENV=live
PADDLE_API_KEY=...
PADDLE_PRODUCT_ID=pro_...
PADDLE_WEBHOOK_SECRET=...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_SITE_URL=https://www.tokbid.lol
SUPABASE_SERVICE_ROLE_KEY=...
```

Webhook Paddle: https://www.tokbid.lol/api/paddle/webhook
Evento: transaction.completed

## Subir

```bash
git add components/BidPanel.tsx lib/paddle.ts lib/applyBid.ts app/api/paddle
git commit -m "Pagos solo con Paddle (quitar Stripe del panel)"
git push
```

Redeploy en Vercel. Prueba en incógnito: el texto debe decir "Paddle", no "Stripe".
