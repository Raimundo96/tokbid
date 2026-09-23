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
        { error: "Escribe tu nombre para poder participar" },
        { status: 400 }
      );
    }

    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: "Falta PADDLE_API_KEY" }, { status: 500 });
    }
    if (!PRODUCT_ID) {
      return NextResponse.json({ error: "Falta PADDLE_PRODUCT_ID" }, { status: 500 });
    }

    const supabase = createClient();
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, tiktok_username, current_bid, status")
      .eq("id", creatorId)
      .eq("status", "active")
      .maybeSingle();

    if (creatorError || !creator) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    if (amount <= Number(creator.current_bid)) {
      return NextResponse.json(
        { error: `Debes superar ${creator.current_bid}` },
        { status: 400 }
      );
    }

    const amountToCharge =
      Math.round((amount - Number(creator.current_bid)) * 100) / 100;

    if (amountToCharge < 0.5) {
      return NextResponse.json(
        { error: "El importe mínimo a cobrar es $0.50" },
        { status: 400 }
      );
    }

    const cleanMessage =
      typeof message === "string" ? message.trim().slice(0, 200) : "";

    const txn = await createPaddleTransaction({
      productId: PRODUCT_ID,
      amountUsd: amountToCharge,
      description: `TokBid ranking — @${creator.tiktok_username}`,
      customData: {
        creator_id: String(creator.id),
        bidder_name: cleanName,
        new_total_bid: String(amount),
        amount_charged: String(amountToCharge),
        creator_share: "0",
        platform_share: String(amountToCharge),
        message: cleanMessage,
      },
    });

    return NextResponse.json({
      transactionId: txn.id,
      amountToCharge,
      newTotalBid: amount,
    });
  } catch (err) {
    console.error("[paddle checkout]", err);
    const text = err instanceof Error ? err.message : "Error al iniciar el pago";
    return NextResponse.json({ error: text }, { status: 500 });
  }
}
