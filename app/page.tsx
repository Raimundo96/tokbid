import Hero from "@/components/Hero";
import Ranking from "@/components/Ranking";
import PodiumSection from "./PodiumSection";
import PaymentStatusBanner from "./PaymentStatusBanner";
import AddByUrl from "@/components/AddByUrl";

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
      <AddByUrl />
      <Ranking />
    </>
  );
}
