"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-base-line bg-base-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg font-extrabold tracking-tight">
          <span
            data-text="TokBid"
            className="glitch-text"
          >
            Tok<span className="text-neon-pink">Bid</span>
          </span>{" "}
          <span className="text-gold">👑</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <Link href="/#ranking" className="hover:text-white transition-colors">Ranking</Link>
          <Link href="/battles" className="hover:text-white transition-colors">Batallas</Link>
          <Link href="/records" className="hover:text-white transition-colors">Récords</Link>
          <Link href="/submit" className="text-neon-cyan hover:text-white transition-colors">+ Añadir creador</Link>
          <Link href="/#como-funciona" className="hover:text-white transition-colors">Cómo funciona</Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {email ? (
            <>
              <span className="text-sm text-white/50">{email}</span>
              <button
                onClick={handleLogout}
                className="focus-ring rounded-full border border-base-line px-4 py-1.5 text-sm text-white/80 hover:border-neon-pink hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-full border border-base-line px-4 py-1.5 text-sm text-white/80 hover:border-neon-cyan hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="focus-ring rounded-full bg-neon-pink px-4 py-1.5 text-sm font-semibold text-white shadow-neon-pink hover:brightness-110 transition"
              >
                Únete
              </Link>
            </>
          )}
        </div>

        <button
          className="focus-ring text-white md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-base-line px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-white/80">
            <Link href="/#ranking" onClick={() => setMenuOpen(false)}>Ranking</Link>
            <Link href="/battles" onClick={() => setMenuOpen(false)}>Batallas</Link>
            <Link href="/records" onClick={() => setMenuOpen(false)}>Récords</Link>
            <Link href="/submit" onClick={() => setMenuOpen(false)} className="text-neon-cyan">+ Añadir creador</Link>
            <Link href="/#como-funciona" onClick={() => setMenuOpen(false)}>Cómo funciona</Link>
            <div className="mt-2 flex gap-3">
              {email ? (
                <button onClick={handleLogout} className="rounded-full border border-base-line px-4 py-1.5">
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <Link href="/login" className="rounded-full border border-base-line px-4 py-1.5">Iniciar sesión</Link>
                  <Link href="/register" className="rounded-full bg-neon-pink px-4 py-1.5 font-semibold">Únete</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
