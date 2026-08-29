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
      const { data, error } = await supabase
        .from("bids")
        .select("id, amount, created_at, creators(tiktok_username)")
        .order("created_at", { ascending: false })
        .limit(8);

      if (!active || error || !data) return;

      const mapped: ActivityItem[] = data.map((b: any) => ({
        id: b.id,
        created_at: b.created_at,
        text: `@${b.creators?.tiktok_username ?? "creador"} aumentó su puja a ${formatMoney(b.amount)}`,
      }));
      setItems(mapped);
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
