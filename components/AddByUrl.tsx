"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { RankingRow } from "@/lib/types";
import { formatFollowers } from "@/lib/utils/format";
import BidPanel from "./BidPanel";

export default function AddByUrl() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creator, setCreator] = useState<RankingRow | null>(null);

  async function handleLookup() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setCreator(null);

    try {
      const lookupRes = await fetch("/api/tiktok/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const lookupData = await lookupRes.json();

      if (!lookupRes.ok) {
        setError(lookupData.error ?? "No se pudo leer ese perfil.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc("get_or_create_creator", {
        p_tiktok_username: lookupData.username,
        p_display_name: lookupData.displayName,
        p_avatar_url: lookupData.avatarUrl,
        p_followers: lookupData.followers ?? 0,
      });

      if (rpcError || !data?.success) {
        setError("No se pudo añadir ese perfil al ranking.");
        setLoading(false);
        return;
      }

      setCreator({
        id: data.id,
        tiktok_username: data.tiktok_username,
        display_name: data.display_name,
        country: null,
        avatar_url: data.avatar_url,
        followers: data.followers,
        current_bid: data.current_bid,
        beat_by: data.current_bid + 1,
        position: 0,
        current_bidder_name: data.current_bidder_name,
      });
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    }
    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-md px-4 pb-10">
      <div className="card-panel rounded-2xl border border-base-line p-6">
        <p className="font-display text-sm font-extrabold uppercase tracking-wide text-white/80">
          ¿No está en el ranking?
        </p>
        <p className="mt-1 text-xs text-white/40">
          Pega el enlace de un perfil de TikTok y puja directamente por él.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            placeholder="https://www.tiktok.com/@usuario"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="focus-ring flex-1 rounded-lg border border-base-line bg-base-panel px-3 py-2 text-sm"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="focus-ring rounded-full bg-neon-cyan px-4 py-2 text-xs font-extrabold uppercase text-black disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
        {error && <p className="mt-3 text-center text-sm text-neon-pink">{error}</p>}
      </div>

      {creator && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-neon-cyan/50">
              {creator.avatar_url ? (
                <Image src={creator.avatar_url} alt={creator.display_name} fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-base-panel">🎤</div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">@{creator.tiktok_username}</p>
              <p className="text-xs text-white/40">{formatFollowers(creator.followers)} seguidores</p>
            </div>
          </div>
          <BidPanel creator={creator} />
        </div>
      )}
    </section>
  );
}
