import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { createPaddleTransaction } from "@/lib/paddle";

const PRODUCT_ID = process.env.PADDLE_PRODUCT_ID!;

/**
 * Lógica de puja — paso 1: crear cobro
 *
 * El usuario elige un total nuevo (ej. $5).
 * Se cobra SOLO la diferencia respecto a la puja actual (ej. actual $3 → cobra $2).
 * Tras el pago, el webhook aplicará place_bid_paid_v2.
 */
export async function POST(request: Request) {
  try {
    const { creatorId, amount, bidderName, message } = await request.json();

    if (!creatorId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const cleanName =
      typeof bidderName === "string" ? bidderName.trim().slice(0, 40) : "";
    if (!cleanName) {
      return NextResponse.json(
        { error: "Escribe tu nombre para poder pujar" },
        { status: 400 }
      );
    }

    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json(
        { error: "Falta PADDLE_API_KEY en el servidor" },
        { status: 500 }
      );
    }

    if (!PRODUCT_ID) {
      return NextResponse.json(
        { error: "Falta PADDLE_PRODUCT_ID" },
        { status: 500 }
      );
    }

    const supabase = createClient();

    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, tiktok_username, current_bid, status")
      .eq("id", creatorId)
      .eq("status", "active")
      .maybeSingle();

    if (creatorError || !creator) {
      return NextResponse.json({ error: "Creador no encontrado" }, { status: 404 });
    }

    // Regla: la nueva puja debe superar la actual
    if (amount <= Number(creator.current_bid)) {
      return NextResponse.json(
        { error: `Debes pujar más de ${creator.current_bid}` },
        { status: 400 }
      );
    }

    // Se cobra solo la diferencia
    const amountToCharge =
      Math.round((amount - Number(creator.current_bid)) * 100) / 100;

    if (amountToCharge < 0.5) {
      return NextResponse.json(
        { error: "El importe mínimo a cobrar es $0.50" },
        { status: 400 }
      );
    }

    // TokBid 100%
    const creatorShare = 0;
    const platformShare = amountToCharge;

    const cleanMessage =
      typeof message === "string" ? message.trim().slice(0, 200) : "";

    const txn = await createPaddleTransaction({
      productId: PRODUCT_ID,
      amountUsd: amountToCharge,
      description: `Superar @${creator.tiktok_username} en TokBid (total $${amount})`,
      customData: {
        creator_id: String(creator.id),
        bidder_name: cleanName,
        new_total_bid: String(amount),
        amount_charged: String(amountToCharge),
        creator_share: String(creatorShare),
        platform_share: String(platformShare),
        message: cleanMessage,
      },
    });

    return NextResponse.json({
      transactionId: txn.id,
      amountToCharge,
      newTotalBid: amount,
    });
  } catch (err) {
    console.error("Paddle checkout error:", err);
    const text = err instanceof Error ? err.message : "Error al iniciar el pago";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
