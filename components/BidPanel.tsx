"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils/format";
import { PlaceBidResult } from "@/lib/types";

interface Props {
  creatorId: string;
  currentBid: number;
  onSuccess?: () => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: "Debes iniciar sesión para pujar.",
  invalid_amount: "El importe debe ser mayor que 0.",
  creator_not_found: "No se pudo encontrar este creador.",
  bid_too_low: "Necesitas superar la puja actual.",
};

export default function BidPanel({ creatorId, currentBid, onSuccess }: Props) {
  const [amount, setAmount] = useState(currentBid + 1);
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setAmount(currentBid + 1);
  }, [currentBid]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsAuthed(!!data.user));
  }, []);

  async function handleBid() {
    setLoading(true);
    setMessage(null);
    const supabase = createClient();

    const { data, error } = await supabase.rpc("place_bid", {
      p_creator_id: creatorId,
      p_amount: amount,
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "❌ No se pudo registrar la puja." });
      return;
    }

    const result = data as PlaceBidResult;

    if (!result.success) {
      const text = result.error ? ERROR_MESSAGES[result.error] : "No se pudo registrar la puja.";
      setMessage({ type: "error", text: text ?? "No se pudo registrar la puja." });
      if (result.minimum_required) setAmount(result.minimum_required);
      return;
    }

    setMessage({ type: "success", text: "🔥 ¡Puja registrada!" });
    onSuccess?.();
  }

  const minimum = currentBid + 1;

  return (
    <div className="card-panel rounded-2xl border border-base-line p-6">
      <p className="font-display text-lg font-extrabold uppercase tracking-wide">⚔️ Supera al #1</p>
      <p className="mt-1 text-sm text-white/50">Puja actual</p>
      <p className="mt-1 font-mono text-4xl font-extrabold text-gold">{formatMoney(currentBid)}</p>
      <p className="mt-2 text-sm text-white/50">
        Para convertirte en #1: <span className="font-bold text-white">{formatMoney(minimum)}</span> mínimo
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Reducir importe"
          onClick={() => setAmount((v) => Math.max(minimum, v - 1))}
          className="focus-ring h-10 w-10 rounded-full border border-base-line text-lg hover:border-neon-cyan"
        >
          −
        </button>
        <span
          key={amount}
          className="min-w-[100px] animate-bidBump text-center font-mono text-xl font-extrabold"
        >
          {formatMoney(amount)}
        </span>
        <button
          type="button"
          aria-label="Aumentar importe"
          onClick={() => setAmount((v) => v + 1)}
          className="focus-ring h-10 w-10 rounded-full border border-base-line text-lg hover:border-neon-pink"
        >
          +
        </button>
      </div>

      {isAuthed === false ? (
        <p className="mt-5 text-center text-sm text-white/50">
          Debes iniciar sesión para pujar.{" "}
          <a href="/login" className="text-neon-cyan underline">Inicia sesión</a>
        </p>
      ) : (
        <button
          type="button"
          disabled={loading || amount <= currentBid}
          onClick={handleBid}
          className="focus-ring mt-5 w-full rounded-full bg-neon-pink py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-neon-pink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Enviando..." : "⚔️ Pujar y ser #1"}
        </button>
      )}

      {message && (
        <p className={`mt-3 text-center text-sm ${message.type === "success" ? "text-neon-cyan" : "text-neon-pink"}`}>
          {message.text}
        </p>
      )}

      <p className="mt-3 text-center text-[11px] text-white/30">Pago seguro · puja de prueba, sin dinero real</p>
    </div>
  );
}
