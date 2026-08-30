import Stripe from "stripe";

// Cliente de Stripe. SOLO se usa en el servidor (rutas /app/api/*),
// nunca en componentes de cliente. STRIPE_SECRET_KEY no lleva
// NEXT_PUBLIC_, así que nunca llega al navegador.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});
