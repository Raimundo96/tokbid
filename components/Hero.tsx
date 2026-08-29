export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-20 text-center">
      <div className="mx-auto max-w-3xl animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-neon-pink">
          Puja. Supera. Domina.
        </span>

        <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-6xl">
          ¿Quién merece
          <br />
          ser el{" "}
          <span
            data-text="#1"
            className="glitch-text text-gradient-pink-cyan"
          >
            #1
          </span>
          ?
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base font-medium text-white/60 sm:text-lg">
          Supera la puja. Sube al ranking. Defiende tu posición.
        </p>

        <div className="mt-8 flex flex-col items-center gap-2">
          <a
            href="#ranking"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-neon-pink px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-neon-pink transition hover:brightness-110"
          >
            ⚔️ Superar al #1
          </a>
          <span className="text-xs text-white/40">Desde $1 · pago de prueba</span>
        </div>
      </div>
    </section>
  );
}
