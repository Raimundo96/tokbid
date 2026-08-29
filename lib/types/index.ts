export interface Profile {
  id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export interface PublicProfile {
  id: string;
  username: string;
}

export type CreatorStatus = "active" | "pending" | "suspended";

export interface Creator {
  id: string;
  owner_id: string | null;
  tiktok_username: string;
  display_name: string;
  country: string | null;
  avatar_url: string | null;
  followers: number;
  current_bid: number;
  status: CreatorStatus;
  created_at: string;
  updated_at: string;
}

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
}

export interface Bid {
  id: string;
  creator_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

export interface Battle {
  id: string;
  winner_creator_id: string;
  previous_creator_id: string | null;
  bid_id: string | null;
  created_at: string;
  winner?: Pick<Creator, "tiktok_username" | "display_name" | "avatar_url" | "current_bid">;
  previous?: Pick<Creator, "tiktok_username" | "display_name" | "avatar_url" | "current_bid">;
}

export interface Category {
  id: string;
  code: string;
  label: string;
  flag_emoji: string | null;
  sort_order: number;
}

export interface PlaceBidResult {
  success: boolean;
  error?: "not_authenticated" | "invalid_amount" | "creator_not_found" | "bid_too_low";
  current_bid?: number;
  minimum_required?: number;
  creator_id?: string;
  new_bid?: number;
  bid_id?: string;
}
