export const metadata = { title: "Política de Privacidad — TokBid" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-white/70">
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Política de Privacidad</h1>
      <p className="mb-8 text-xs text-white/40">Última actualización: 30/08/2026</p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">1. Responsable</h2>
      <p className="mb-6">
        [Tu nombre o razón social], contacto: Raimundoevita96@gmail.com, es responsable del
        tratamiento de los datos personales recogidos a través de TokBid.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">2. Qué datos recogemos</h2>
      <p className="mb-6">
        Email y contraseña (para tu cuenta), el nombre de usuario público que elijas, el
        historial de pujas que realices, y los perfiles de TikTok que añadas al ranking. Los
        datos de tu tarjeta de pago los procesa directamente Stripe: nunca los almacenamos ni
        los vemos nosotros.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">3. Para qué los usamos</h2>
      <p className="mb-6">
        Para crear y gestionar tu cuenta, mostrar el ranking público, procesar tus pujas y pagos,
        y comunicarnos contigo sobre el servicio.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">4. Con quién compartimos datos</h2>
      <p className="mb-6">
        Usamos proveedores externos para operar TokBid: Supabase (base de datos y
        autenticación), Vercel (alojamiento web) y Stripe (procesamiento de pagos). Cada uno
        trata los datos según sus propias políticas de privacidad. No vendemos tus datos a
        terceros con fines publicitarios.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">5. Cuánto tiempo los conservamos</h2>
      <p className="mb-6">
        Mientras tu cuenta esté activa. Si solicitas eliminar tu cuenta, borraremos tus datos
        personales salvo lo que debamos conservar por obligación legal (por ejemplo, registros
        de pagos con fines contables).
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">6. Tus derechos</h2>
      <p className="mb-6">
        Puedes solicitar acceder a, corregir, o eliminar tus datos personales, escribiendo a
        Raimundoevita96@gmail.com. Si resides en la Unión Europea, también tienes derecho a la
        portabilidad de tus datos y a presentar una reclamación ante tu autoridad de protección
        de datos.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">7. Cookies</h2>
      <p className="mb-6">
        Usamos cookies técnicas necesarias para mantener tu sesión iniciada (gestionadas por
        Supabase Auth). No usamos cookies de publicidad ni de seguimiento de terceros.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">8. Contacto</h2>
      <p className="mb-6">
        Para cualquier duda sobre esta Política, escribe a Raimundoevita96@gmail.com.
      </p>
    </section>
  );
}
