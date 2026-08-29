import Hero from "@/components/Hero";
import Ranking from "@/components/Ranking";
import ActivityFeed from "@/components/ActivityFeed";
import PodiumSection from "./PodiumSection";
import BidCallout from "./BidCallout";

export default function HomePage() {
  return (
    <>
      <Hero />
      <PodiumSection />
      <BidCallout />
      <Ranking />
      <ActivityFeed />

      <section id="como-funciona" className="mx-auto max-w-3xl px-4 pb-24">
        <h2 className="mb-4 font-display text-xl font-extrabold uppercase tracking-wide">Cómo funciona</h2>
        <ol className="space-y-3 text-sm text-white/60">
          <li className="card-panel rounded-xl border border-base-line p-4">
            <span className="font-mono font-bold text-neon-pink">1.</span> Únete con tu email y contraseña.
          </li>
          <li className="card-panel rounded-xl border border-base-line p-4">
            <span className="font-mono font-bold text-neon-pink">2.</span> Elige a quién quieres superar y mira su puja actual.
          </li>
          <li className="card-panel rounded-xl border border-base-line p-4">
            <span className="font-mono font-bold text-neon-pink">3.</span> Puja por encima del mínimo y quítale el puesto.
          </li>
          <li className="card-panel rounded-xl border border-base-line p-4">
            <span className="font-mono font-bold text-neon-pink">4.</span> El ranking cambia al instante. Defiende tu posición o vuelven a superarte.
          </li>
        </ol>
        <p className="mt-4 text-xs text-white/30">
          Esta primera versión no procesa dinero real: las pujas son de prueba.
        </p>
      </section>
    </>
  );
}
