"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/utils/format";

interface Props {
  username: string;
  position: number;
  bid: number;
}

export default function ShareButton({ username, position, bid }: Props) {
  const [copied, setCopied] = useState(false);

  const text =
    position === 1
      ? `🔥 @${username} está actualmente #1 en TokBid con una puja de ${formatMoney(bid)}. ¿Quién conseguirá superarlo?`
      : `🔥 @${username} está en el puesto #${position} de TokBid con una puja de ${formatMoney(bid)}. ¡Sigue la competición!`;

  const url = typeof window !== "undefined" ? window.location.href : "";

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // el usuario canceló el share nativo; no hacemos nada más
      }
    }
    handleCopy();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="focus-ring rounded-full border border-neon-cyan/50 px-4 py-2 text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/10 transition"
      >
        Compartir posición
      </button>
      <button
        onClick={handleCopy}
        className="focus-ring rounded-full border border-base-line px-4 py-2 text-sm text-white/70 hover:text-white transition"
      >
        {copied ? "¡Copiado!" : "Copiar enlace"}
      </button>
    </div>
  );
}
