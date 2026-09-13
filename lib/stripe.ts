import Stripe from "stripe";

// Cliente de Stripe. SOLO se usa en el servidor (rutas /app/api/*).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});
