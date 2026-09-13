export type CreatorStatus = "active" | "pending" | "suspended";

export interface RankingRow {
  id: string;
  tiktok_username: string;
  display_name: string;
  country: string | null;
  avatar_url: string | null;
  followers: number;
  current_bid: number;
  beat_by: number;
  position: number;
  current_bidder_name: string | null;
}
