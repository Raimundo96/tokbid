import Link from "next/link";
import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <Link href="/" className="mb-8 inline-flex text-sm text-white/60 transition hover:text-white">
          ← Volver a Tokbid
        </Link>

        <header className="mb-10 border-b border-white/10 pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-white/50">Última actualización: {updated}</p>
        </header>

        <article className="legal-content text-[15px] leading-7 text-white/75 sm:text-base">
          {children}
        </article>

        <footer className="mt-14 border-t border-white/10 pt-6 text-sm text-white/50">
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/pricing" className="hover:text-white">Precios</Link>
            <Link href="/terms" className="hover:text-white">Condiciones de servicio</Link>
            <Link href="/privacy" className="hover:text-white">Política de privacidad</Link>
            <Link href="/refunds" className="hover:text-white">Política de reembolso</Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold text-white sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>;
}
