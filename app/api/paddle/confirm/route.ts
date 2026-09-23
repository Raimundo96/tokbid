import { NextResponse } from "next/server";
import { getPaddleTransaction } from "@/lib/paddle";
import { applyPaidBid } from "@/lib/applyBid";

/** Confirma el pago con la API de Paddle y sube el ranking (no depende del webhook). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactionId = body.transactionId as string;

    if (!transactionId) {
      return NextResponse.json({ error: "Falta transactionId" }, { status: 400 });
    }

    console.log("[paddle confirm] txn=", transactionId);

    let txn = await getPaddleTransaction(transactionId);

    if (txn.status !== "completed" && txn.status !== "billed" && txn.status !== "paid") {
      await new Promise((r) => setTimeout(r, 1500));
      txn = await getPaddleTransaction(transactionId);
      if (txn.status !== "completed" && txn.status !== "billed" && txn.status !== "paid") {
        return NextResponse.json(
          { error: `Pago no completado aún (status: ${txn.status})` },
          { status: 400 }
        );
      }
    }

    const custom = txn.custom_data || {};
    const creatorId = custom.creator_id;
    const bidderName = custom.bidder_name;
    const newTotalBid = Number(custom.new_total_bid);
    const amountCharged = Number(custom.amount_charged);

    if (!creatorId || !bidderName || !newTotalBid || !amountCharged) {
      return NextResponse.json(
        { error: "custom_data incompleta", custom },
        { status: 400 }
      );
    }

    const result = await applyPaidBid({
      creatorId,
      bidderName,
      amountCharged,
      newTotalBid,
      paymentId: transactionId,
      message: custom.message || null,
      creatorShare: Number(custom.creator_share ?? 0),
      platformShare: Number(custom.platform_share ?? amountCharged),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error aplicando puntuación" },
        { status: 500 }
      );
    }

    console.log("[paddle confirm] OK", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[paddle confirm]", err);
    const text = err instanceof Error ? err.message : "Error confirmando";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
