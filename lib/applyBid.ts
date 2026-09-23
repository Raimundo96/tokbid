import { createAdminClient } from "@/lib/supabase/admin";

/** Aplica una puja ya pagada (misma lógica que con Stripe). */
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

  const { data: existing } = await admin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", params.paymentId)
    .maybeSingle();

  if (existing) {
    return { success: true, duplicate: true };
  }

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

  const v1 = await admin.rpc("place_bid_paid", {
    p_creator_id: params.creatorId,
    p_bidder_name: params.bidderName,
    p_amount_charged: params.amountCharged,
    p_new_total_bid: params.newTotalBid,
    p_stripe_payment_intent_id: params.paymentId,
  });

  if (v1.error) {
    console.error("[applyPaidBid] v1:", v1.error, "v2 was:", v2.error);
    return { success: false, error: v1.error.message || "No se pudo aplicar la puja" };
  }

  return { success: true, result: v1.data, via: "v1" as const };
}
