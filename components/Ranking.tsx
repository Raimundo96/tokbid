"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankingRow } from "@/lib/types";
import { formatMoney, formatFollowers, countryFlag } from "@/lib/utils/format";
import BidPanel from "./BidPanel";

export default function Ranking() {
  const [rows, setRows] = useState<RankingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RankingRow | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("ranking_view")
        .select("*")
        .order("position", { ascending: true });

      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const list = data as RankingRow[];
      setRows(list);
      // Solo mantenemos selección si el usuario ya eligió uno (no auto-abrir panel)
      setSelected((prev) => {
        if (!prev) return null;
        return list.find((r) => r.id === prev.id) ?? null;
      });
    }

    load();

    const channel = supabase
      .channel("ranking-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "creators" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (error) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-center text-neon-pink">❌ No se pudo cargar el ranking.</p>;
  }

  if (rows === null) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-center text-white/50">⏳ Cargando ranking...</p>;
  }

  if (rows.length === 0) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-center text-white/50">Aún no hay creadores. Sé el primero.</p>;
  }

  return (
    <div id="ranking" className="mx-auto max-w-3xl px-4 pb-20">
      <h2 className="mb-4 font-display text-xl font-bold">Ranking del juego</h2>
      <div className="overflow-hidden rounded-2xl border border-base-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-line bg-white/[0.02] text-white/50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Ref.</th>
              <th className="px-4 py-3 font-medium">Puntos</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Último jugador</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-base-line/60 last:border-0 transition-colors ${
                  selected?.id === row.id ? "bg-neon-pink/5" : "hover:bg-white/[0.03]"
                }`}
              >
                <td className="px-4 py-3 font-mono text-white/60">{row.position}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span>{countryFlag(row.country)}</span>
                    <span className="font-semibold">@{row.tiktok_username}</span>
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-white/50 sm:table-cell">{formatFollowers(row.followers)}</td>
                <td className="px-4 py-3 font-mono font-bold text-neon-cyan">{formatMoney(row.current_bid)}</td>
                <td className="hidden px-4 py-3 text-white/50 sm:table-cell">
                  {row.current_bidder_name ? `@${row.current_bidder_name}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      setSelected(row);
                      // Scroll al panel de puja tras el siguiente render
                      setTimeout(() => {
                        document.getElementById("bid-panel")?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }, 50);
                    }}
                    className="focus-ring rounded-full border border-neon-pink/40 px-3 py-1 text-xs font-bold uppercase text-neon-pink hover:bg-neon-pink/10"
                  >
                    Jugar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel de apoyo: solo cuando el usuario pulsa Apoyar */}
      {selected && (
        <div id="bid-panel" className="mt-8">
          <BidPanel creator={selected} />
        </div>
      )}
    </div>
  );
}
