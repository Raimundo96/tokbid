import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Aplica una puja ya pagada.
 * Usa place_bid_paid (la misma que funcionaba con Stripe).
 * Si existe place_bid_paid_v2, también la intenta.
 */
export async function applyPaidBid(params: {
  creatorId: string;
  bidderName: string;
  amountCharged: number;
  newTotalBid: number;
  paymentId: string;
  message?: string | null;
  creatorShare?: number;
  platformShare?: number;
}) {
  const admin = createAdminClient();

  // Idempotencia: no aplicar dos veces el mismo pago
  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", params.paymentId)
    .maybeSingle();

  if (existing) {
    return { success: true, duplicate: true };
  }

  // 1) Intentar v2 (con split) si existe
  const v2 = await admin.rpc("place_bid_paid_v2", {
    p_creator_id: params.creatorId,
    p_bidder_name: params.bidderName,
    p_amount_charged: params.amountCharged,
    p_new_total_bid: params.newTotalBid,
    p_payment_id: params.paymentId,
    p_creator_share: params.creatorShare ?? 0,
    p_platform_share: params.platformShare ?? params.amountCharged,
    p_message: params.message ?? null,
  });

  if (!v2.error) {
    return { success: true, result: v2.data, via: "v2" as const };
  }

  // 2) Fallback: la función que YA funcionaba con Stripe
  const v1 = await admin.rpc("place_bid_paid", {
    p_creator_id: params.creatorId,
    p_bidder_name: params.bidderName,
    p_amount_charged: params.amountCharged,
    p_new_total_bid: params.newTotalBid,
    p_stripe_payment_intent_id: params.paymentId,
  });

  if (v1.error) {
    console.error("[applyPaidBid] v1 error:", v1.error);
    console.error("[applyPaidBid] v2 error was:", v2.error);
    return {
      success: false,
      error: v1.error.message || "No se pudo aplicar la puja",
    };
  }

  return { success: true, result: v1.data, via: "v1" as const };
}
