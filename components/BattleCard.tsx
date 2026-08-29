import Link from "next/link";
import { Battle } from "@/lib/types";
import { formatMoney, timeAgo } from "@/lib/utils/format";

export default function BattleCard({ battle }: { battle: Battle }) {
  const winner = battle.winner;
  const previous = battle.previous;

  return (
    <div className="card-panel rounded-2xl border border-base-line p-5">
      <p className="text-sm text-white/70">
        🔥{" "}
        <Link href={`/creator/${winner?.tiktok_username}`} className="font-semibold text-neon-pink hover:underline">
          @{winner?.tiktok_username ?? "??"}
        </Link>{" "}
        intenta {previous ? "quitarle el puesto a" : "entrar en el ranking, cerca de"}{" "}
        {previous ? (
          <Link href={`/creator/${previous.tiktok_username}`} className="font-semibold text-neon-cyan hover:underline">
            @{previous.tiktok_username}
          </Link>
        ) : (
          "los líderes"
        )}
      </p>

      {previous && (
        <p className="mt-2 font-mono text-sm text-white/50">
          {formatMoney(winner?.current_bid ?? 0)} vs {formatMoney(previous.current_bid)}
        </p>
      )}

      <p className="mt-3 text-xs text-white/30">{timeAgo(battle.created_at)}</p>
    </div>
  );
}
