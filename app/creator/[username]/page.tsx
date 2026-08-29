import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatFollowers, countryFlag, timeAgo } from "@/lib/utils/format";
import CreatorBidSection from "./CreatorBidSection";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("ranking_view")
    .select("*")
    .eq("tiktok_username", username)
    .maybeSingle();

  if (!row) notFound();

  const { data: history } = await supabase
    .from("bids")
    .select("id, amount, created_at, bidder_id")
    .eq("creator_id", row.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const bidderIds = [...new Set((history ?? []).map((b) => b.bidder_id))];
  const { data: bidders } = bidderIds.length
    ? await supabase.from("public_profiles").select("id, username").in("id", bidderIds)
    : { data: [] as { id: string; username: string }[] };

  const usernameById = new Map((bidders ?? []).map((p) => [p.id, p.username]));

  const isDefending = row.position === 1;

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <div className="card-panel rounded-2xl border border-base-line p-8 text-center">
        <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-neon-cyan">
          {row.avatar_url ? (
            <Image src={row.avatar_url} alt={row.display_name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-base-panel text-3xl">🎤</div>
          )}
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold">@{row.tiktok_username}</h1>
        <p className="text-sm text-white/50">{row.display_name}</p>

        <p className="mt-3 text-sm text-white/60">
          {formatFollowers(row.followers)} seguidores · {countryFlag(row.country)}
        </p>

        <p className="mt-4 font-display text-xl font-bold">
          {row.position === 1 ? "🏆" : `#${row.position}`}
        </p>
        <p className="mt-1 font-mono text-3xl font-bold text-gold">{formatMoney(row.current_bid)}</p>
        {row.current_bidder_username && (
          <p className="mt-1 text-xs text-white/50">
            Puja actual de <span className="text-white">@{row.current_bidder_username}</span>
          </p>
        )}

        {isDefending && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-neon-pink/10 px-3 py-1 text-xs font-semibold text-neon-pink">
            🔥 Defendiendo el #1
          </p>
        )}

        <div className="mt-6 flex justify-center">
          <ShareButton username={row.tiktok_username} position={row.position} bid={row.current_bid} />
        </div>
      </div>

      <div className="mt-8">
        <CreatorBidSection creatorId={row.id} currentBid={row.current_bid} />
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-lg font-bold">Historial de pujas</h2>
        {history && history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-base-line px-4 py-3 text-sm"
              >
                <span className="text-white/70">@{usernameById.get(b.bidder_id) ?? "Alguien"}</span>
                <span className="font-mono text-neon-cyan">{formatMoney(b.amount)}</span>
                <span className="text-xs text-white/40">{timeAgo(b.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/40">Aún no hay pujas registradas para este creador.</p>
        )}
      </div>
    </section>
  );
}
