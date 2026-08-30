import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

// IMPORTANTE: esta ruta es la ÚNICA fuente de verdad para confirmar
// que un pago sucedió de verdad. Nunca actualizamos una puja porque
// el navegador diga que "pagó" — solo lo hacemos aquí, después de
// verificar la firma criptográfica de Stripe.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const admin = createAdminClient();

  // Idempotencia: si ya procesamos este evento antes (Stripe puede
  // reenviar el mismo webhook), no lo volvemos a aplicar.
  const { error: insertEventError } = await admin
    .from("stripe_events")
    .insert({ event_id: event.id });

  if (insertEventError) {
    // Violación de unicidad = ya procesado antes. Respondemos OK y salimos.
    return NextResponse.json({ received: true, duplicate: true });
  }

  const creatorId = session.metadata?.creator_id;
  const bidderId = session.metadata?.bidder_id;
  const newTotalBid = Number(session.metadata?.new_total_bid);
  const amountCharged = Number(session.metadata?.amount_charged);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!creatorId || !bidderId || !newTotalBid || !paymentIntentId) {
    console.error("Webhook de Stripe con metadata incompleta", session.id);
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  const { data, error } = await admin.rpc("place_bid_paid", {
    p_creator_id: creatorId,
    p_bidder_id: bidderId,
    p_amount_charged: amountCharged,
    p_new_total_bid: newTotalBid,
    p_stripe_payment_intent_id: paymentIntentId,
  });

  if (error) {
    console.error("Error aplicando place_bid_paid:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true, result: data });
}
