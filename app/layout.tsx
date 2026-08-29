import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import UsernameGate from "@/components/UsernameGate";

export const metadata: Metadata = {
  title: "TokBid — ¿Quién merece ser el #1?",
  description:
    "La plataforma de ranking y pujas para creadores de TikTok. Puja para subir, supera a los mejores.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-body antialiased min-h-screen flex flex-col">
        <Navbar />
        <UsernameGate />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-base-line py-8 text-center text-sm text-white/40">
          TokBid — Puja de prueba, sin dinero real en esta versión.
        </footer>
      </body>
    </html>
  );
}
