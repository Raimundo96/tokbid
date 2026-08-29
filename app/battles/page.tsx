"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Battle } from "@/lib/types";
import BattleCard from "@/components/BattleCard";

export default function BattlesPage() {
  const [battles, setBattles] = useState<Battle[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data, error } = await supabase
        .from("battles")
        .select(
          `id, created_at, winner_creator_id, previous_creator_id, bid_id,
           winner:creators!battles_winner_creator_id_fkey(tiktok_username, display_name, avatar_url, current_bid),
           previous:creators!battles_previous_creator_id_fkey(tiktok_username, display_name, avatar_url, current_bid)`
        )
        .order("created_at", { ascending: false })
        .limit(30);

      if (!active) return;
      if (error) {
        setError(true);
        return;
      }
      setBattles(data as unknown as Battle[]);
    }

    load();

    const channel = supabase
      .channel("battles-page")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "battles" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold">⚔️ Batallas activas</h1>
      <p className="mb-8 text-sm text-white/50">
        Cada vez que una puja cambia posiciones relevantes en el ranking, se registra aquí.
      </p>

      {error && <p className="text-neon-pink">❌ No se pudieron cargar las batallas.</p>}

      {!error && battles === null && <p className="text-white/50">⏳ Cargando ranking...</p>}

      {!error && battles?.length === 0 && (
        <p className="text-white/50">Aún no hay batallas. Sé el primero en provocar una.</p>
      )}

      {battles && battles.length > 0 && (
        <div className="space-y-4">
          {battles.map((b) => (
            <BattleCard key={b.id} battle={b} />
          ))}
        </div>
      )}
    </section>
  );
}
