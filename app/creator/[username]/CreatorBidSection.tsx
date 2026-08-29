"use client";

import { useRouter } from "next/navigation";
import BidPanel from "@/components/BidPanel";

export default function CreatorBidSection({
  creatorId,
  currentBid,
}: {
  creatorId: string;
  currentBid: number;
}) {
  const router = useRouter();
  return <BidPanel creatorId={creatorId} currentBid={currentBid} onSuccess={() => router.refresh()} />;
}
