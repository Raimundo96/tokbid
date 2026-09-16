import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TokBid — Ranking social de entretenimiento",
  description:
    "Juego de ranking independiente. Compite en una tabla por diversión. No afiliado a TikTok. No aumenta seguidores ni vistas en redes sociales.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-base-line px-4 py-8 text-center text-sm text-white/40">
          <p>TokBid — juego de ranking de entretenimiento. Pagos procesados de forma segura.</p>
          <p className="mx-auto mt-2 max-w-xl text-[11px] leading-relaxed text-white/30">
            TokBid no está afiliado, asociado ni respaldado por TikTok. No aumenta seguidores, vistas
            ni alcance en ninguna red social. Solo afecta al ranking de este sitio.
          </p>
          <nav
            aria-label="Información legal"
            className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs"
          >
            <a href="/pricing" className="hover:text-white/70">
              Precios
            </a>
            <a href="/refunds" className="hover:text-white/70">
              Reembolsos
            </a>
            <a href="/terms" className="hover:text-white/70">
              Términos y Condiciones
            </a>
            <a href="/privacy" className="hover:text-white/70">
              Privacidad
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
