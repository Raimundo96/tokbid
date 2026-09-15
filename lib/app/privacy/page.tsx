export const metadata = { title: "Política de Privacidad — TokBid" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-white/70">
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Política de Privacidad</h1>
      <p className="mb-8 text-xs text-white/40">Última actualización: [completa la fecha]</p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">1. Responsable</h2>
      <p className="mb-6">[Tu nombre o razón social], contacto: [tu email de contacto].</p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">2. Qué datos recogemos</h2>
      <p className="mb-6">
        TokBid no requiere cuenta ni registro. Al pujar, solo pedimos el nombre que quieras
        mostrar públicamente junto a tu puja. Los datos de tu tarjeta de pago los procesa
        directamente Stripe: nunca los almacenamos ni los vemos nosotros.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">3. Con quién compartimos datos</h2>
      <p className="mb-6">
        Usamos Supabase (base de datos), Vercel (alojamiento web) y Stripe (pagos). No vendemos
        tus datos a terceros con fines publicitarios.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">4. Tus derechos</h2>
      <p className="mb-6">
        Puedes solicitar corregir o eliminar el nombre asociado a una puja escribiendo a
        [tu email de contacto].
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">5. Contacto</h2>
      <p className="mb-6">Para cualquier duda, escribe a [tu email de contacto].</p>
    </section>
  );
}
