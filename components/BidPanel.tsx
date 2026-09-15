"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/utils/format";
import { RankingRow } from "@/lib/types";

interface Props {
  creator: RankingRow;
}

declare global {
  interface Window {
    Paddle?: {
      Environment: { set: (env: "sandbox" | "production") => void };
      Initialize: (opts: {
        token: string;
        eventCallback?: (data: { name: string; data?: unknown }) => void;
      }) => void;
      Checkout: {
        open: (opts: {
          transactionId: string;
          settings?: { displayMode?: string; theme?: string; locale?: string };
        }) => void;
      };
    };
  }
}

let paddleReady: Promise<void> | null = null;

function loadPaddle(): Promise<void> {
  if (paddleReady) return paddleReady;

  paddleReady = new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token || !window.Paddle) {
        reject(new Error("Paddle no disponible"));
        return;
      }

      if (process.env.NEXT_PUBLIC_PADDLE_ENV !== "live") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({
        token,
        eventCallback: (event) => {
          if (event.name === "checkout.completed") {
            // El ranking se actualiza vía webhook; refrescamos la página
            setTimeout(() => {
              window.location.href = "/?paid=success";
            }, 1500);
          }
        },
      });
      resolve();
    };
    script.onerror = () => reject(new Error("No se pudo cargar Paddle.js"));
    document.body.appendChild(script);
  });

  return paddleReady;
}

export default function BidPanel({ creator }: Props) {
  const currentBid = creator.current_bid;
  const [amount, setAmount] = useState(currentBid + 1);
  const [name, setName] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    setAmount(currentBid + 1);
    setMessage(null);
  }, [creator.id, currentBid]);

  async function handleBid() {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Escribe tu nombre para poder pujar." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/paddle/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          amount,
          bidderName: name.trim(),
          message: supportMessage.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.transactionId) {
        setMessage({ type: "error", text: data.error ?? "No se pudo iniciar el pago." });
        setLoading(false);
        return;
      }

      await loadPaddle();

      if (!window.Paddle) {
        setMessage({ type: "error", text: "Paddle no está listo. Recarga la página." });
        setLoading(false);
        return;
      }

      window.Paddle.Checkout.open({
        transactionId: data.transactionId,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "es",
        },
      });

      setLoading(false);
    } catch {
      setMessage({
        type: "error",
        text: "No se pudo conectar con el pago. Inténtalo de nuevo.",
      });
      setLoading(false);
    }
  }

  const minimum = currentBid + 1;
  const toCharge = Math.max(amount - currentBid, 0);

  return (
    <div className="card-panel rounded-2xl border border-base-line p-6">
      <p className="font-display text-lg font-extrabold uppercase tracking-wide">
        ⚔️ Superar a @{creator.tiktok_username}
      </p>
      <p className="mt-1 text-sm text-white/50">Puja actual</p>
      <p className="mt-1 font-mono text-4xl font-extrabold text-gold">{formatMoney(currentBid)}</p>
      <p className="mt-2 text-sm text-white/50">
        Para superarla: <span className="font-bold text-white">{formatMoney(minimum)}</span> mínimo
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

      <p className="mt-2 text-center text-xs text-white/40">
        Pagarás <span className="text-white/70">{formatMoney(toCharge)}</span> (la diferencia para
        superar la puja actual)
      </p>

      <input
        type="text"
        required
        placeholder="Tu nombre (se mostrará en el ranking)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        className="focus-ring mt-4 w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-center text-sm"
      />

      <input
        type="text"
        placeholder="Mensaje de apoyo (opcional)"
        value={supportMessage}
        onChange={(e) => setSupportMessage(e.target.value)}
        maxLength={200}
        className="focus-ring mt-2 w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-center text-sm"
      />

      <button
        type="button"
        disabled={loading || amount <= currentBid}
        onClick={handleBid}
        className="focus-ring mt-4 w-full rounded-full bg-neon-pink py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-neon-pink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Abriendo pago..." : "⚔️ Pagar y superar"}
      </button>

      {message && (
        <p
          className={`mt-3 text-center text-sm ${
            message.type === "success" ? "text-neon-cyan" : "text-neon-pink"
          }`}
        >
          {message.text}
        </p>
      )}

      <p className="mt-3 text-center text-[11px] text-white/30">
        🔒 Pago seguro con Paddle · sin cuenta ni registro
      </p>
    </div>
  );
}
