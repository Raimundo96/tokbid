"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils/format";

interface RecordsData {
  highestBid: { username: string; amount: number } | null;
  mostBids: { username: string; count: number } | null;
  mostBattles: { username: string; count: number } | null;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="card-panel flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-base-line p-6 text-center">
      <span className="text-2xl">🏆</span>
      <p className="mt-2 text-sm text-white/40">{label}</p>
      <p className="text-xs text-white/25">Aún no hay suficientes datos.</p>
    </div>
  );
}

export default function Records() {
  const [data, setData] = useState<RecordsData | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: topCreator } = await supabase
        .from("creators")
        .select("tiktok_username, current_bid")
        .eq("status", "active")
        .order("current_bid", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: bidCounts } = await supabase
        .from("bids")
        .select("creator_id, creators(tiktok_username)")
        .limit(500);

      let mostBids: RecordsData["mostBids"] = null;
      if (bidCounts && bidCounts.length > 0) {
        const counts = new Map<string, { username: string; count: number }>();
        for (const b of bidCounts as any[]) {
          const uname = b.creators?.tiktok_username ?? "desconocido";
          const entry = counts.get(uname) ?? { username: uname, count: 0 };
          entry.count += 1;
          counts.set(uname, entry);
        }
        mostBids = [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
      }

      const { data: battleCounts } = await supabase
        .from("battles")
        .select("winner_creator_id, creators!battles_winner_creator_id_fkey(tiktok_username)")
        .limit(500);

      let mostBattles: RecordsData["mostBattles"] = null;
      if (battleCounts && battleCounts.length > 0) {
        const counts = new Map<string, { username: string; count: number }>();
        for (const b of battleCounts as any[]) {
          const uname = b.creators?.tiktok_username ?? "desconocido";
          const entry = counts.get(uname) ?? { username: uname, count: 0 };
          entry.count += 1;
          counts.set(uname, entry);
        }
        mostBattles = [...counts.values()].sort((a, b) => b.count - a.count)[0] ?? null;
      }

      setData({
        highestBid: topCreator ? { username: topCreator.tiktok_username, amount: topCreator.current_bid } : null,
        mostBids,
        mostBattles,
      });
    }

    load();
  }, []);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="mb-6 font-display text-2xl font-bold">🏆 Récords</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {data?.highestBid ? (
          <div className="card-panel rounded-2xl border border-gold/40 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-white/40">Mayor puja</p>
            <p className="mt-2 font-mono text-2xl font-bold text-gold">
              {formatMoney(data.highestBid.amount)}
            </p>
            <p className="text-sm text-white/50">@{data.highestBid.username}</p>
          </div>
        ) : (
          <EmptyState label="Mayor puja" />
        )}

        {data?.mostBids ? (
          <div className="card-panel rounded-2xl border border-neon-cyan/40 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-white/40">Más pujas recibidas</p>
            <p className="mt-2 font-mono text-2xl font-bold text-neon-cyan">{data.mostBids.count}</p>
            <p className="text-sm text-white/50">@{data.mostBids.username}</p>
          </div>
        ) : (
          <EmptyState label="Más pujas recibidas" />
        )}

        {data?.mostBattles ? (
          <div className="card-panel rounded-2xl border border-neon-pink/40 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-white/40">Más batallas ganadas</p>
            <p className="mt-2 font-mono text-2xl font-bold text-neon-pink">{data.mostBattles.count}</p>
            <p className="text-sm text-white/50">@{data.mostBattles.username}</p>
          </div>
        ) : (
          <EmptyState label="Más batallas ganadas" />
        )}
      </div>
    </section>
  );
}
