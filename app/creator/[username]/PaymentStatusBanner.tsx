"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentStatusBanner({ status }: { status?: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(!!status);

  useEffect(() => {
    if (status !== "success") return;

    // El pago ya se confirmó en Stripe, pero el webhook puede tardar
    // un instante en aplicarse. Refrescamos un par de veces para que
    // se vea la puja actualizada sin que el usuario tenga que hacerlo.
    const t1 = setTimeout(() => router.refresh(), 1500);
    const t2 = setTimeout(() => router.refresh(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [status, router]);

  if (!visible || !status) return null;

  if (status === "success") {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 px-4 py-3 text-sm">
        <span>✅ Pago recibido. Actualizando el ranking...</span>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white">✕</button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white/60">
        <span>Pago cancelado. No se ha cobrado nada.</span>
        <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white">✕</button>
      </div>
    );
  }

  return null;
}
