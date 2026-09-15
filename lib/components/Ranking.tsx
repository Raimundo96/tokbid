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
      setSelected((prev) => {
        if (!prev) return list[0] ?? null;
        // Mantenemos seleccionado el mismo creador, con los datos frescos
        return list.find((r) => r.id === prev.id) ?? list[0] ?? null;
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
      {selected && (
        <div className="mb-8">
          <BidPanel creator={selected} />
        </div>
      )}

      <h2 className="mb-4 font-display text-xl font-bold">Ranking completo</h2>
      <div className="overflow-hidden rounded-2xl border border-base-line">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-base-line bg-white/[0.02] text-white/50">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Creador</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Seguidores</th>
              <th className="px-4 py-3 font-medium">Puja</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Puja de</th>
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
                      document.getElementById("ranking")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="focus-ring rounded-full border border-neon-pink/40 px-3 py-1 text-xs font-bold uppercase text-neon-pink hover:bg-neon-pink/10"
                  >
                    Superar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
