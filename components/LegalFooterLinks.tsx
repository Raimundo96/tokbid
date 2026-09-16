import Link from "next/link";

export default function LegalFooterLinks() {
  return (
    <nav aria-label="Información legal" className="flex flex-wrap gap-x-4 gap-y-2">
      <Link href="/pricing">Precios</Link>
      <Link href="/terms">Condiciones de servicio</Link>
      <Link href="/privacy">Política de privacidad</Link>
      <Link href="/refunds">Política de reembolso</Link>
    </nav>
  );
}
