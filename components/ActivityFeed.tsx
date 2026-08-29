"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatMoney, timeAgo } from "@/lib/utils/format";

interface ActivityItem {
  id: string;
  text: string;
  created_at: string;
}

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data: bids, error } = await supabase
        .from("bids")
        .select("id, amount, created_at, bidder_id, creators(tiktok_username)")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!active || error || !bids) return;

      // Buscamos los nombres de usuario públicos de quienes pujaron,
      // en una consulta aparte (a través de la vista public_profiles).
      const bidderIds = [...new Set(bids.map((b: any) => b.bidder_id))];
      const { data: bidders } = await supabase
        .from("public_profiles")
        .select("id, username")
        .in("id", bidderIds);

      const usernameById = new Map((bidders ?? []).map((p: any) => [p.id, p.username]));

      const mapped: ActivityItem[] = bids.map((b: any) => {
        const bidderName = usernameById.get(b.bidder_id) ?? "Alguien";
        const creatorName = b.creators?.tiktok_username ?? "un creador";
        return {
          id: b.id,
          created_at: b.created_at,
          text: `@${bidderName} pujó ${formatMoney(b.amount)} por @${creatorName}`,
        };
      });

      if (active) setItems(mapped);
    }

    load();

    const channel = supabase
      .channel("activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 pb-16">
      <h2 className="mb-4 font-display text-xl font-bold">🔥 Actividad reciente</h2>
      {items === null ? (
        <p className="text-sm text-white/40">⏳ Cargando ranking...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-white/40">Aún no hay actividad. Sé el primero.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="card-panel flex items-center justify-between rounded-xl border border-base-line px-4 py-3 text-sm"
            >
              <span className="text-white/80">{item.text}</span>
              <span className="text-xs text-white/40">{timeAgo(item.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
