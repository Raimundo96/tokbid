import Link from "next/link";
import Image from "next/image";
import { RankingRow } from "@/lib/types";
import { formatMoney, formatFollowers, countryFlag } from "@/lib/utils/format";

export default function CreatorCard({ row }: { row: RankingRow }) {
  return (
    <Link
      href={`/creator/${row.tiktok_username}`}
      className="focus-ring card-panel flex items-center gap-4 rounded-xl border border-base-line p-4 transition-colors hover:border-neon-cyan/50"
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-base-line">
        {row.avatar_url ? (
          <Image src={row.avatar_url} alt={row.display_name} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-base-panel">🎤</div>
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold">@{row.tiktok_username} {countryFlag(row.country)}</p>
        <p className="text-xs text-white/40">
          {formatFollowers(row.followers)} seguidores
          {row.current_bidder_username && ` · puja de @${row.current_bidder_username}`}
        </p>
      </div>
      <p className="font-mono font-bold text-neon-cyan">{formatMoney(row.current_bid)}</p>
    </Link>
  );
}
