export const metadata = { title: "Términos y Condiciones — TokBid" };

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-white/70">
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Términos y Condiciones</h1>
      <p className="mb-8 text-xs text-white/40">Última actualización: [completa la fecha]</p>

      <p className="mb-6">
        Estos Términos regulan el uso de TokBid (la "Plataforma"), operada por [tu nombre o
        razón social] ("nosotros"). Al usar la Plataforma, aceptas estos Términos.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">1. Qué es TokBid</h2>
      <p className="mb-6">
        TokBid es un ranking público en el que cualquiera puede pujar dinero real, con solo un
        nombre (sin necesidad de crear una cuenta), para colocar un perfil de TikTok en una
        posición más alta. La posición se pierde en cuanto otro usuario puja más alto: no es una
        compra de un bien ni un servicio garantizado a largo plazo.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">2. Edad mínima</h2>
      <p className="mb-6">Debes tener al menos 18 años para pujar, ya que la Plataforma procesa pagos reales.</p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">3. Pagos</h2>
      <p className="mb-6">
        Los pagos se procesan a través de Stripe. Al pujar, se te cobra únicamente la diferencia
        necesaria para superar la puja actual del creador (no el importe total mostrado en el
        ranking).
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">4. Reembolsos</h2>
      <p className="mb-6">
        No se ofrecen reembolsos por el simple hecho de que otro usuario supere tu puja después.
        Sí se investigará cualquier cobro duplicado, no autorizado, o fallo técnico demostrable.
        Para reclamar, contacta con [tu email de soporte].
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">5. Perfiles en el ranking</h2>
      <p className="mb-6">
        Nos reservamos el derecho de eliminar o suspender cualquier perfil del ranking, incluso a
        petición de la persona representada en él, sin necesidad de justificación previa.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">6. Usos prohibidos</h2>
      <p className="mb-6">
        No está permitido usar nombres ofensivos, suplantar a otra persona, publicar contenido
        ilegal o difamatorio, ni intentar vulnerar la seguridad de la Plataforma.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">7. Limitación de responsabilidad</h2>
      <p className="mb-6">
        TokBid se ofrece "tal cual". No garantizamos que el servicio esté libre de
        interrupciones o errores.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">8. Contacto</h2>
      <p className="mb-6">Para cualquier duda, escribe a [tu email de contacto].</p>
    </section>
  );
}
