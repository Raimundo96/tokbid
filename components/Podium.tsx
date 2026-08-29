import Link from "next/link";
import Image from "next/image";
import { RankingRow } from "@/lib/types";
import { formatMoney, formatFollowers, countryFlag } from "@/lib/utils/format";

const MEDAL: Record<number, string> = { 1: "👑", 2: "🥈", 3: "🥉" };

function PodiumCard({ row }: { row: RankingRow }) {
  const isFirst = row.position === 1;
  return (
    <Link
      href={`/creator/${row.tiktok_username}`}
      className={`focus-ring group relative flex flex-col items-center rounded-2xl border p-6 transition-transform hover:-translate-y-1 ${
        isFirst
          ? "order-first border-gold/50 bg-gradient-to-b from-gold/10 to-transparent shadow-neon-gold sm:order-none sm:scale-110"
          : "border-base-line card-panel"
      }`}
    >
      <span className="text-3xl">{MEDAL[row.position]}</span>
      <div className={`relative mt-3 h-20 w-20 overflow-hidden rounded-full border-2 ${isFirst ? "border-gold" : "border-neon-cyan/50"}`}>
        {row.avatar_url ? (
          <Image src={row.avatar_url} alt={row.display_name} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-base-panel text-2xl">🎤</div>
        )}
      </div>
      <p className="mt-3 font-display font-bold">@{row.tiktok_username}</p>
      <p className="text-xs text-white/50">{row.display_name} · {countryFlag(row.country)}</p>
      <p className={`mt-2 font-mono text-lg font-bold ${isFirst ? "text-gold" : "text-neon-cyan"}`}>
        {formatMoney(row.current_bid)}
      </p>
      {row.current_bidder_username && (
        <p className="mt-0.5 text-[11px] text-white/40">
          puja de <span className="text-white/60">@{row.current_bidder_username}</span>
        </p>
      )}
      <p className="text-[11px] text-white/40">{formatFollowers(row.followers)} seguidores</p>
    </Link>
  );
}

export default function Podium({ rows }: { rows: RankingRow[] }) {
  const top3 = rows.slice(0, 3);
  if (top3.length === 0) return null;

  const [first, second, third] = top3;

  return (
    <section className="mx-auto max-w-4xl px-4 pb-16">
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
        {second && <PodiumCard row={second} />}
        {first && <PodiumCard row={first} />}
        {third && <PodiumCard row={third} />}
      </div>
    </section>
  );
}
