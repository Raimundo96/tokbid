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
        eventCallback?: (data: {
          name: string;
          data?: Record<string, unknown>;
        }) => void;
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
let paddleInitialized = false;

async function confirmTransaction(transactionId: string) {
  try {
    sessionStorage.setItem("tokbid_last_txn", transactionId);
  } catch {
    /* ignore */
  }

  const res = await fetch("/api/paddle/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transactionId }),
  });
  const data = await res.json().catch(() => ({}));
  console.log("[tokbid] confirm", res.status, data);
  return res.ok;
}

function loadPaddle(): Promise<void> {
  if (paddleReady) return paddleReady;

  paddleReady = new Promise((resolve, reject) => {
    const init = () => {
      const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
      if (!token || !window.Paddle) {
        reject(new Error("Paddle no disponible"));
        return;
      }
      // "live" o "production" → producción; cualquier otro → sandbox
      const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
      if (env === "live" || env === "production") {
        // producción por defecto en Paddle.js
      } else {
        window.Paddle.Environment.set("sandbox");
      }
      if (!paddleInitialized) {
        window.Paddle.Initialize({
          token,
          eventCallback: async (event) => {
            console.log("[tokbid] paddle event", event.name, event.data);
            if (event.name === "checkout.completed") {
              const d = event.data || {};
              const txnId =
                (d.transaction_id as string) ||
                (d.id as string) ||
                sessionStorage.getItem("tokbid_last_txn") ||
                "";
              if (txnId) {
                await confirmTransaction(txnId);
              }
              setTimeout(() => {
                window.location.href = "/?paid=success";
              }, 1000);
            }
          },
        });
        paddleInitialized = true;
      }
      resolve();
    };

    if (window.Paddle) {
      init();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => init();
    script.onerror = () => reject(new Error("No se pudo cargar Paddle.js"));
    document.body.appendChild(script);
  });

  return paddleReady;
}

export default function BidPanel({ creator }: Props) {
  const currentBid = Number(creator.current_bid);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "success") return;
    const txn = sessionStorage.getItem("tokbid_last_txn");
    if (!txn) return;
    confirmTransaction(txn).finally(() => {
      try {
        sessionStorage.removeItem("tokbid_last_txn");
      } catch {
        /* ignore */
      }
    });
  }, []);

  async function handleBid() {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Escribe tu nombre para participar." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // SOLO Paddle — no Stripe
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

      try {
        sessionStorage.setItem("tokbid_last_txn", data.transactionId);
      } catch {
        /* ignore */
      }

      await loadPaddle();
      if (!window.Paddle) {
        setMessage({ type: "error", text: "Paddle no está listo. Recarga." });
        setLoading(false);
        return;
      }

      window.Paddle.Checkout.open({
        transactionId: data.transactionId,
        settings: { displayMode: "overlay", theme: "dark", locale: "es" },
      });
      setLoading(false);
    } catch {
      setMessage({ type: "error", text: "No se pudo conectar con el pago." });
      setLoading(false);
    }
  }

  const minimum = currentBid + 1;
  const toCharge = Math.max(amount - currentBid, 0);

  return (
    <div className="card-panel rounded-2xl border border-base-line p-6">
      <p className="font-display text-lg font-extrabold uppercase tracking-wide">
        🎮 Subir a @{creator.tiktok_username} en el ranking
      </p>
      <p className="mt-1 text-sm text-white/50">Puntos en el juego</p>
      <p className="mt-1 font-mono text-4xl font-extrabold text-gold">{formatMoney(currentBid)}</p>
      <p className="mt-2 text-sm text-white/50">
        Para pasar al siguiente puesto:{" "}
        <span className="font-bold text-white">{formatMoney(minimum)}</span>
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setAmount((v) => Math.max(minimum, v - 1))}
          className="focus-ring h-10 w-10 rounded-full border border-base-line text-lg hover:border-neon-cyan"
        >
          −
        </button>
        <span className="min-w-[100px] text-center font-mono text-xl font-extrabold">
          {formatMoney(amount)}
        </span>
        <button
          type="button"
          onClick={() => setAmount((v) => v + 1)}
          className="focus-ring h-10 w-10 rounded-full border border-base-line text-lg hover:border-neon-pink"
        >
          +
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-white/40">
        Participación: <span className="text-white/70">{formatMoney(toCharge)}</span>
      </p>

      <input
        type="text"
        placeholder="Tu nombre (en el ranking del juego)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={40}
        className="focus-ring mt-4 w-full rounded-lg border border-base-line bg-base-panel px-3 py-2 text-center text-sm"
      />
      <input
        type="text"
        placeholder="Mensaje (opcional)"
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
        {loading ? "Abriendo pago..." : "🎮 Jugar y subir en el ranking"}
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
      <p className="mt-3 text-center text-[11px] leading-relaxed text-white/30">
        🔒 Pago seguro con Paddle · solo afecta al ranking de TokBid · sin cuenta ni registro
      </p>
    </div>
  );
}
