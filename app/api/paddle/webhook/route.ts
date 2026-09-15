import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Lógica de puja — paso 2: pago confirmado
 *
 * Paddle envía transaction.completed → aplicamos place_bid_paid_v2
 * → sube current_bid y aparece en el ranking.
 */

function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v];
    })
  );

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  const payload = `${ts}:${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(h1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");
  const secret = process.env.PADDLE_WEBHOOK_SECRET || "";
  const skipVerify = process.env.PADDLE_SKIP_WEBHOOK_VERIFY === "true";

  if (!skipVerify && !verifyPaddleSignature(rawBody, signature, secret)) {
    console.error("[paddle webhook] firma inválida");
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  let event: {
    event_id?: string;
    event_type?: string;
    data?: {
      id?: string;
      status?: string;
      custom_data?: Record<string, string> | null;
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  console.log("[paddle webhook]", event.event_type, event.event_id || event.data?.id);

  if (event.event_type !== "transaction.completed") {
    return NextResponse.json({ received: true, ignored: event.event_type });
  }

  const admin = createAdminClient();
  const eventId = event.event_id || event.data?.id || "";

  // No procesar el mismo evento dos veces
  if (eventId) {
    const { error: dupErr } = await admin.from("paddle_events").insert({ event_id: eventId });
    if (dupErr) {
      console.log("[paddle webhook] evento duplicado", eventId);
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  const custom = event.data?.custom_data || {};
  const creatorId = custom.creator_id;
  const bidderName = custom.bidder_name;
  const newTotalBid = Number(custom.new_total_bid);
  const amountCharged = Number(custom.amount_charged);
  const creatorShare = Number(custom.creator_share ?? 0);
  const platformShare = Number(custom.platform_share ?? amountCharged);
  const message = custom.message || null;
  const paymentId = event.data?.id || eventId;

  if (!creatorId || !bidderName || !newTotalBid || !amountCharged) {
    console.error("[paddle webhook] custom_data incompleta", custom);
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  const { data, error } = await admin.rpc("place_bid_paid_v2", {
    p_creator_id: creatorId,
    p_bidder_name: bidderName,
    p_amount_charged: amountCharged,
    p_new_total_bid: newTotalBid,
    p_payment_id: paymentId,
    p_creator_share: creatorShare,
    p_platform_share: platformShare,
    p_message: message,
  });

  if (error) {
    console.error("[paddle webhook] place_bid_paid_v2 error:", error);
    // Fallback a función antigua si existe
    const v1 = await admin.rpc("place_bid_paid", {
      p_creator_id: creatorId,
      p_bidder_name: bidderName,
      p_amount_charged: amountCharged,
      p_new_total_bid: newTotalBid,
      p_stripe_payment_intent_id: paymentId,
    });
    if (v1.error) {
      console.error("[paddle webhook] place_bid_paid fallback error:", v1.error);
      return NextResponse.json({ error: "Error aplicando puja" }, { status: 500 });
    }
    return NextResponse.json({ received: true, result: v1.data, via: "v1" });
  }

  console.log("[paddle webhook] puja aplicada", data);
  return NextResponse.json({ received: true, result: data });
}
