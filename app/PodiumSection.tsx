"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RankingRow } from "@/lib/types";
import Podium from "@/components/Podium";

export default function PodiumSection() {
  const [rows, setRows] = useState<RankingRow[]>([]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      const { data } = await supabase
        .from("ranking_view")
        .select("*")
        .order("position", { ascending: true })
        .limit(3);
      if (active && data) setRows(data as RankingRow[]);
    }

    load();

    const channel = supabase
      .channel("podium-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "creators" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return <Podium rows={rows} />;
}
