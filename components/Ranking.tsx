"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankingRow } from "@/lib/types";
import { formatMoney, formatFollowers, countryFlag } from "@/lib/utils/format";

export default function Ranking() {
  const [rows, setRows] = useState<RankingRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      setRows(data as RankingRow[]);
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
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-neon-pink">
        ❌ No se pudo cargar el ranking.
      </p>
    );
  }

  if (rows === null) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-white/50">
        ⏳ Cargando ranking...
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-center text-white/50">
        Aún no hay creadores. Sé el primero.
      </p>
    );
  }

  return (
    <div id="ranking" className="mx-auto max-w-3xl px-4 pb-20">
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
              <th className="px-4 py-3 font-medium">Superar por</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-base-line/60 last:border-0 hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3 font-mono text-white/60">{row.position}</td>
                <td className="px-4 py-3">
                  <Link href={`/creator/${row.tiktok_username}`} className="focus-ring flex items-center gap-2">
                    <span>{countryFlag(row.country)}</span>
                    <span className="font-semibold">@{row.tiktok_username}</span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-white/50 sm:table-cell">
                  {formatFollowers(row.followers)}
                </td>
                <td className="px-4 py-3 font-mono font-bold text-neon-cyan">
                  {formatMoney(row.current_bid)}
                </td>
                <td className="hidden px-4 py-3 text-white/50 sm:table-cell">
                  {row.current_bidder_username ? `@${row.current_bidder_username}` : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-white/50">{formatMoney(row.beat_by)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
