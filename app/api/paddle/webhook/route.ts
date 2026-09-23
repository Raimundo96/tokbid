import { NextResponse } from "next/server";
import crypto from "crypto";
import { applyPaidBid } from "@/lib/applyBid";

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
  const expected = crypto
    .createHmac("sha256", secret.trim())
    .update(`${ts}:${rawBody}`)
    .digest("hex");
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
  const skip = process.env.PADDLE_SKIP_WEBHOOK_VERIFY === "true";

  if (!skip && !verifyPaddleSignature(rawBody, signature, secret)) {
    console.error("[paddle webhook] firma inválida");
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  let event: {
    event_type?: string;
    data?: { id?: string; custom_data?: Record<string, string> | null };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (event.event_type !== "transaction.completed") {
    return NextResponse.json({ received: true, ignored: event.event_type });
  }

  const custom = event.data?.custom_data || {};
  const paymentId = event.data?.id || "";
  if (!custom.creator_id || !custom.bidder_name || !paymentId) {
    return NextResponse.json({ error: "Metadata incompleta" }, { status: 400 });
  }

  const result = await applyPaidBid({
    creatorId: custom.creator_id,
    bidderName: custom.bidder_name,
    amountCharged: Number(custom.amount_charged),
    newTotalBid: Number(custom.new_total_bid),
    paymentId,
    message: custom.message || null,
    creatorShare: Number(custom.creator_share ?? 0),
    platformShare: Number(custom.platform_share ?? custom.amount_charged),
  });

  return NextResponse.json({ received: true, ...result });
}
