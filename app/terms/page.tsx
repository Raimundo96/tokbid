export const metadata = { title: "Términos y Condiciones — TokBid" };

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16 text-sm leading-relaxed text-white/70">
      <h1 className="mb-2 font-display text-2xl font-bold text-white">Términos y Condiciones</h1>
      <p className="mb-8 text-xs text-white/40">Última actualización: 30/08/2026</p>

      <p className="mb-6">
        Estos Términos regulan el uso de TokBid (la "Plataforma"), operada por
        Raimundo evita ("nosotros"). Al registrarte o usar la Plataforma, aceptas estos Términos.
        Si no estás de acuerdo, no uses TokBid.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">1. Qué es TokBid</h2>
      <p className="mb-6">
        TokBid es un ranking público en el que los usuarios pueden pujar dinero real para
        colocar un perfil de TikTok en una posición más alta. La posición se pierde en cuanto
        otro usuario puja más alto: no es una compra de un bien ni un servicio garantizado a
        largo plazo, sino el pago por ocupar una posición mientras nadie te supere.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">2. Edad mínima</h2>
      <p className="mb-6">
        Debes tener al menos 18 años para registrarte y pujar, ya que la Plataforma procesa
        pagos reales.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">3. Pagos</h2>
      <p className="mb-6">
        Los pagos se procesan a través de Stripe. Al pujar, se te cobra únicamente la diferencia
        necesaria para superar la puja actual del creador (no el importe total mostrado en el
        ranking). Los cargos se procesan en el momento de la puja y son, salvo lo indicado en la
        sección 4, definitivos.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">4. Reembolsos</h2>
      <p className="mb-6">
        No se ofrecen reembolsos por el simple hecho de que otro usuario supere tu puja después:
        esa es la mecánica normal de la Plataforma y la aceptas al pujar. Sí se investigará y, en
        su caso, se reembolsará cualquier cobro duplicado, cobro no autorizado, o fallo técnico
        demostrable de la Plataforma. Para reclamar, contacta con rayevita96@gmail.com.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">5. Cuentas de usuario</h2>
      <p className="mb-6">
        Eres responsable de mantener segura tu contraseña y de toda la actividad realizada desde
        tu cuenta. Puedes solicitar la eliminación de tu cuenta y datos personales en cualquier
        momento contactando con Raimundoevita96@gmail.com.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">6. Perfiles añadidos por usuarios</h2>
      <p className="mb-6">
        Cualquier usuario puede añadir un perfil de TikTok al ranking. Al hacerlo, declaras que
        la información añadida es pública y veraz. Nos reservamos el derecho de eliminar o
        suspender cualquier perfil, incluso a petición de la persona representada en él, sin
        necesidad de justificación previa.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">7. Usos prohibidos</h2>
      <p className="mb-6">
        No está permitido: crear cuentas falsas o automatizadas para manipular el ranking,
        suplantar a otra persona, publicar contenido ilegal, difamatorio o que incite al odio, ni
        intentar vulnerar la seguridad de la Plataforma.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">8. Limitación de responsabilidad</h2>
      <p className="mb-6">
        TokBid se ofrece "tal cual". En la medida permitida por la ley, no nos hacemos
        responsables de pérdidas indirectas derivadas del uso de la Plataforma, ni garantizamos
        que el servicio esté libre de interrupciones o errores.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">9. Cambios en estos Términos</h2>
      <p className="mb-6">
        Podemos actualizar estos Términos en cualquier momento. Los cambios importantes se
        anunciarán en la Plataforma.
      </p>

      <h2 className="mt-8 mb-2 font-display text-lg font-bold text-white">10. Contacto</h2>
      <p className="mb-6">
        Para cualquier duda sobre estos Términos, escribe a Raimundoevita96@gmail.com.
      </p>
    </section>
  );
}
