import Hero from "@/components/Hero";
import Ranking from "@/components/Ranking";
import PodiumSection from "./PodiumSection";
import PaymentStatusBanner from "./PaymentStatusBanner";

export default function HomePage({
  searchParams,
}: {
  searchParams: { paid?: string };
}) {
  return (
    <>
      <PaymentStatusBanner status={searchParams.paid} />
      <Hero />
      <PodiumSection />
      <Ranking />
    </>
  );
}
