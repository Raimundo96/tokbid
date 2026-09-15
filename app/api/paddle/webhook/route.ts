import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Verifica la firma del webhook de Paddle (Paddle-Signature header).
 * Formato: ts=...;h1=...
 * Docs: https://developer.paddle.com/webhooks/signature-verification
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

  // En sandbox puedes desactivar la verificación temporalmente si hace falta
  const skipVerify = process.env.PADDLE_SKIP_WEBHOOK_VERIFY === "true";

  if (!skipVerify && !verifyPaddleSignature(rawBody, signature, secret)) {
    console.error("Paddle webhook: firma inválida");
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

  // Solo nos interesa el pago completado
  if (event.event_type !== "transaction.completed") {
    return NextResponse.json({ received: true, ignored: event.event_type });
  }

  const admin = createAdminClient();
  const eventId = event.event_id || event.data?.id || "";

  // Idempotencia: no procesar el mismo evento dos veces
  if (eventId) {
    const { error: dupErr } = await admin.from("paddle_events").insert({ event_id: eventId });
    if (dupErr) {
      // Ya procesado
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
    console.error("Paddle webhook: custom_data incompleta", custom);
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  // Preferimos place_bid_paid_v2 (con split). Si no existe, usamos place_bid_paid.
  let data: unknown;
  let error: { message?: string } | null = null;

  const v2 = await admin.rpc("place_bid_paid_v2", {
    p_creator_id: creatorId,
    p_bidder_name: bidderName,
    p_amount_charged: amountCharged,
    p_new_total_bid: newTotalBid,
    p_payment_id: paymentId,
    p_creator_share: creatorShare,
    p_platform_share: platformShare,
    p_message: message,
  });

  if (v2.error) {
    // Fallback a la función antigua
    const v1 = await admin.rpc("place_bid_paid", {
      p_creator_id: creatorId,
      p_bidder_name: bidderName,
      p_amount_charged: amountCharged,
      p_new_total_bid: newTotalBid,
      p_stripe_payment_intent_id: paymentId,
    });
    data = v1.data;
    error = v1.error;
  } else {
    data = v2.data;
    error = v2.error;
  }

  if (error) {
    console.error("Error aplicando puja pagada:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true, result: data });
}
