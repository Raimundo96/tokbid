export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-14 pt-20 text-center">
      <div className="mx-auto max-w-3xl animate-rise">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-neon-pink">
          Ranking social · Solo entretenimiento
        </span>

        <h1 className="mt-6 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-6xl">
          El ranking
          <br />
          más divertido de{" "}
          <span data-text="la comunidad" className="glitch-text text-gradient-pink-cyan">
            la comunidad
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base font-medium text-white/60 sm:text-lg">
          Un juego de ranking independiente. Participa, sube en la tabla y compite por diversión.
          Sin cuentas ni registro.
        </p>

        <div className="mt-8 flex flex-col items-center gap-2">
          <a
            href="#ranking"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-neon-pink px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-neon-pink transition hover:brightness-110"
          >
            🎮 Ver el ranking
          </a>
          <span className="text-xs text-white/40">Desde $1 · juego independiente</span>
        </div>

        <p className="mx-auto mt-8 max-w-lg rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-white/45">
          ⚠️ TokBid es un <strong className="text-white/60">juego de ranking de entretenimiento</strong>,
          independiente y sin conexión técnica con TikTok.{" "}
          <strong className="text-white/60">No aumenta seguidores, vistas ni alcance real</strong> en
          ninguna red social. Solo afecta a la tabla de este sitio.
        </p>
      </div>
    </section>
  );
}
