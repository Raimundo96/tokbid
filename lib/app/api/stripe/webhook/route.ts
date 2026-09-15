import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Falta firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const admin = createAdminClient();

  const { error: insertEventError } = await admin.from("stripe_events").insert({ event_id: event.id });
  if (insertEventError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const creatorId = session.metadata?.creator_id;
  const bidderName = session.metadata?.bidder_name;
  const newTotalBid = Number(session.metadata?.new_total_bid);
  const amountCharged = Number(session.metadata?.amount_charged);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  if (!creatorId || !bidderName || !newTotalBid || !paymentIntentId) {
    console.error("Webhook de Stripe con metadata incompleta", session.id);
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  const { data, error } = await admin.rpc("place_bid_paid", {
    p_creator_id: creatorId,
    p_bidder_name: bidderName,
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
