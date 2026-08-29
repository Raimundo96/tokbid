"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankingRow } from "@/lib/types";
import BidPanel from "@/components/BidPanel";

export default function BidCallout() {
  const [top, setTop] = useState<RankingRow | null | undefined>(undefined);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("ranking_view")
      .select("*")
      .eq("position", 1)
      .maybeSingle();
    setTop((data as RankingRow) ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  if (!top) return null;

  return (
    <section className="mx-auto max-w-md px-4 pb-16">
      <BidPanel creatorId={top.id} currentBid={top.current_bid} onSuccess={load} />
    </section>
  );
}
