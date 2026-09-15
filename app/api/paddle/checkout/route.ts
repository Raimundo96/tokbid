import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { createPaddleTransaction } from "@/lib/paddle";

const PRODUCT_ID = process.env.PADDLE_PRODUCT_ID!;

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

    if (!PRODUCT_ID) {
      return NextResponse.json(
        { error: "Paddle no configurado (falta PADDLE_PRODUCT_ID)" },
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

    if (amount <= creator.current_bid) {
      return NextResponse.json(
        { error: `Debes pujar más de ${creator.current_bid}` },
        { status: 400 }
      );
    }

    const amountToCharge = amount - creator.current_bid;
    if (amountToCharge < 0.5) {
      return NextResponse.json(
        { error: "El importe mínimo a cobrar es $0.50" },
        { status: 400 }
      );
    }

    // TokBid se queda con el 100% de la puja
    const creatorShare = 0;
    const platformShare = amountToCharge;

    const cleanMessage =
      typeof message === "string" ? message.trim().slice(0, 200) : "";

    const txn = await createPaddleTransaction({
      productId: PRODUCT_ID,
      amountUsd: amountToCharge,
      description: `Superar @${creator.tiktok_username} en TokBid`,
      customData: {
        creator_id: creator.id,
        bidder_name: cleanName,
        new_total_bid: String(amount),
        amount_charged: String(amountToCharge),
        creator_share: String(creatorShare),
        platform_share: String(platformShare),
        message: cleanMessage,
      },
    });

    return NextResponse.json({ transactionId: txn.id });
  } catch (err) {
    console.error("Paddle checkout error:", err);
    const text = err instanceof Error ? err.message : "Error al iniciar el pago";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
