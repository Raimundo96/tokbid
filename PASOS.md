# TokBid → Paddle: guía paso a paso

Este ZIP arregla el error de Vercel (`Can't resolve '@/lib/paddle'` y `AddByUrl`)
y deja los pagos con Paddle (TokBid 100%).

---

## Contenido del ZIP

```
tokbid-paddle-fix/
├── lib/paddle.ts                         ← OBLIGATORIO (faltaba en el build)
├── components/BidPanel.tsx               ← Reemplaza el de Stripe
├── components/AddByUrl.tsx               ← Por si lo borraste sin querer
├── app/api/paddle/checkout/route.ts      ← Nueva ruta
├── app/api/paddle/webhook/route.ts       ← Nueva ruta
├── supabase/migration_paddle.sql        ← SQL en Supabase (una vez)
└── PASOS.md                              ← Esta guía
```

---

## PASO 1 — Descargar y abrir tu proyecto

1. Descarga este ZIP y descomprímelo.
2. Abre la carpeta de tu proyecto TokBid en el ordenador
   (la misma desde la que haces `git push` a Vercel).

---

## PASO 2 — Copiar archivos (importante: NO borres el resto)

Copia **archivo por archivo** así:

| Desde el ZIP | A tu proyecto |
|--------------|---------------|
| `lib/paddle.ts` | `lib/paddle.ts` **(crear si no existe la carpeta lib)** |
| `components/BidPanel.tsx` | `components/BidPanel.tsx` **(reemplazar)** |
| `components/AddByUrl.tsx` | `components/AddByUrl.tsx` **(solo si te falta)** |
| `app/api/paddle/checkout/route.ts` | `app/api/paddle/checkout/route.ts` **(crear carpetas)** |
| `app/api/paddle/webhook/route.ts` | `app/api/paddle/webhook/route.ts` **(crear carpetas)** |

En Windows / Mac puedes crear las carpetas a mano:

```
app/api/paddle/checkout/
app/api/paddle/webhook/
```

**No borres** Ranking, Navbar, Hero, Podium, ni las rutas de TikTok.

---

## PASO 3 — Variables de entorno en Vercel

1. Entra en [vercel.com](https://vercel.com) → tu proyecto **tokbid**.
2. **Settings → Environment Variables**.
3. Añade (o actualiza) estas:

```env
PADDLE_ENV=sandbox
PADDLE_API_KEY=pega_aqui_tu_api_key_de_sandbox
PADDLE_PRODUCT_ID=pro_01m2gt5fdxpvecrn16bmzkspt8
PADDLE_WEBHOOK_SECRET=pega_aqui_el_secret_del_webhook
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=pega_aqui_tu_client_token
NEXT_PUBLIC_PADDLE_ENV=sandbox
NEXT_PUBLIC_SITE_URL=https://tokbid.lol
```

4. Guarda. Si te pregunta el entorno, márcalas para **Production**, **Preview** y **Development**.

Las claves están en el panel de Paddle (Sandbox):
- API key → Developer tools → Authentication → API keys
- Client token → Developer tools → Authentication → Client-side tokens
- Webhook secret → Developer tools → Notifications → tu destino webhook

---

## PASO 4 — SQL en Supabase (solo una vez)

1. Entra en [supabase.com](https://supabase.com) → tu proyecto.
2. **SQL Editor → New query**.
3. Abre el archivo `supabase/migration_paddle.sql` del ZIP.
4. Copia TODO el contenido, pégalo y pulsa **Run**.

Esto crea la tabla `paddle_events` y la función `place_bid_paid_v2`.

---

## PASO 5 — Subir a GitHub / Vercel

En la terminal, dentro de la carpeta del proyecto:

```bash
git add lib/paddle.ts
git add components/BidPanel.tsx
git add components/AddByUrl.tsx
git add app/api/paddle
git status
```

Revisa que aparezcan esos archivos y que **no** hayas borrado otros por error.

```bash
git add -A
git commit -m "Integrar Paddle y corregir archivos faltantes"
git push
```

Vercel empezará un deploy automático.

---

## PASO 6 — Comprobar que el build pasa

1. En Vercel → **Deployments**.
2. El último debe quedar en verde: **Ready**.
3. Si falla otra vez, abre **Build Logs** y mira el mensaje.
   - Si dice otra vez `Can't resolve '@/lib/paddle'` → el archivo no se subió (repasa el PASO 2 y el `git add`).

---

## PASO 7 — Probar una puja

1. Abre https://tokbid.lol en **ventana de incógnito**.
2. Elige un creador (o añádelo con @).
3. Pon nombre + importe y pulsa **Pagar y superar**.
4. Debe abrirse el **overlay de Paddle** (no Stripe).
5. Paga con tarjeta de prueba: `4242 4242 4242 4242`, fecha futura, CVC `123`.

En los logs de Vercel debe aparecer:

```text
POST ... /api/paddle/checkout
```

**No** `/api/stripe/checkout`.

---

## Si algo falla

| Problema | Qué hacer |
|----------|-----------|
| Build: Can't resolve @/lib/paddle | Falta `lib/paddle.ts` en el repo. Cópialo y haz push otra vez. |
| Build: Can't resolve AddByUrl | Restaura `components/AddByUrl.tsx` del ZIP. |
| Se abre Stripe | El BidPanel viejo sigue desplegado. Sustituye BidPanel y vuelve a hacer deploy. |
| Overlay no abre | Revisa `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` y `NEXT_PUBLIC_PADDLE_ENV=sandbox`. |
| Pagas y no sube el ranking | Webhook URL + evento `transaction.completed` + `PADDLE_WEBHOOK_SECRET` + SQL ejecutado. |

---

## Recordatorio Paddle (Sandbox)

- Product ID: `pro_01m2gt5fdxpvecrn16bmzkspt8`
- Webhook: `https://tokbid.lol/api/paddle/webhook`
- Evento: `transaction.completed`
- Default payment link: `https://tokbid.lol`
- TokBid se queda con el **100%** de cada puja.
