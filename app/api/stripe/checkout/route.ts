import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { creatorId, amount } = await request.json();

  if (!creatorId || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para pujar" }, { status: 401 });
  }

  // Leemos el creador para calcular cuánto hay que COBRAR de verdad
  // (solo la diferencia sobre la puja actual, no el total).
  const { data: creator, error: creatorError } = await supabase
    .from("creators")
    .select("id, tiktok_username, current_bid, status")
    .eq("id", creatorId)
    .eq("status", "active")
    .maybeSingle();

  if (creatorError || !creator) {
    return NextResponse.json({ error: "Creador no encontrado" }, { status: 404 });
  }

  if (amount <= creator.current_bid) {
    return NextResponse.json(
      { error: `Debes pujar más de ${creator.current_bid}` },
      { status: 400 }
    );
  }

  const amountToCharge = amount - creator.current_bid;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Superar la puja de @${creator.tiktok_username} en TokBid`,
            description: `Nueva puja total: $${amount}`,
          },
          unit_amount: Math.round(amountToCharge * 100), // Stripe usa céntimos
        },
        quantity: 1,
      },
    ],
    metadata: {
      creator_id: creator.id,
      bidder_id: user.id,
      new_total_bid: String(amount),
      amount_charged: String(amountToCharge),
    },
    success_url: `${siteUrl}/creator/${creator.tiktok_username}?paid=success`,
    cancel_url: `${siteUrl}/creator/${creator.tiktok_username}?paid=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
