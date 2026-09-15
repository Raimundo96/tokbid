import { NextResponse } from "next/server";
import { getPaddleTransaction } from "@/lib/paddle";
import { applyPaidBid } from "@/lib/applyBid";

/**
 * Ruta PRINCIPAL para subir el ranking tras pagar.
 * No depende del webhook de Paddle.
 *
 * Flujo:
 * 1. El cliente termina el checkout
 * 2. Llama aquí con transactionId
 * 3. Verificamos en Paddle que status = completed
 * 4. Aplicamos place_bid_paid (la misma lógica que Stripe)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transactionId = body.transactionId as string;

    if (!transactionId) {
      return NextResponse.json({ error: "Falta transactionId" }, { status: 400 });
    }

    console.log("[paddle confirm] txn=", transactionId);

    const txn = await getPaddleTransaction(transactionId);
    console.log("[paddle confirm] status=", txn.status, "custom=", txn.custom_data);

    // En sandbox a veces el status tarda un instante
    if (txn.status !== "completed" && txn.status !== "billed" && txn.status !== "paid") {
      // Reintento corto: a veces el status aún es "ready" o "drafted" al instante
      await new Promise((r) => setTimeout(r, 1500));
      const again = await getPaddleTransaction(transactionId);
      console.log("[paddle confirm] retry status=", again.status);
      if (
        again.status !== "completed" &&
        again.status !== "billed" &&
        again.status !== "paid"
      ) {
        return NextResponse.json(
          { error: `Pago no completado aún (status: ${again.status})` },
          { status: 400 }
        );
      }
      Object.assign(txn, again);
    }

    const custom = txn.custom_data || {};
    const creatorId = custom.creator_id;
    const bidderName = custom.bidder_name;
    const newTotalBid = Number(custom.new_total_bid);
    const amountCharged = Number(custom.amount_charged);

    if (!creatorId || !bidderName || !newTotalBid || !amountCharged) {
      return NextResponse.json(
        { error: "custom_data incompleta en la transacción", custom },
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
        { error: result.error || "Error aplicando puja" },
        { status: 500 }
      );
    }

    console.log("[paddle confirm] OK", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[paddle confirm] exception", err);
    const text = err instanceof Error ? err.message : "Error confirmando";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
