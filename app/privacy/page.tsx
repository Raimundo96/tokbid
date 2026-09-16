import type { Metadata } from "next";
import LegalPage, { List, Paragraph, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad | Tokbid",
  description: "Política de privacidad de Tokbid y tratamiento de datos de los usuarios.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad" updated="15 de septiembre de 2026">
      <Section title="1. Información general">
        <Paragraph>Esta Política de Privacidad explica qué información puede tratar Tokbid cuando utilizas la plataforma, para qué se utiliza y qué opciones tienes respecto de tus datos.</Paragraph>
        <Paragraph>El responsable del tratamiento es <strong className="text-white">Raimundo Evita Dialo Manga</strong>. Contacto: <strong className="text-white">Raimundoevita96@gmail.com</strong>.</Paragraph>
      </Section>

      <Section title="2. Datos que nos proporcionas al pujar">
        <Paragraph>Tokbid no requiere crear una cuenta. Al pujar, tratamos el nombre que elijas mostrar públicamente junto a tu puja y, si lo escribes, el mensaje de apoyo opcional. No se solicita email, contraseña ni ningún otro dato de registro.</Paragraph>
      </Section>

      <Section title="3. Datos de uso">
        <Paragraph>Podemos tratar información técnica y de uso necesaria para proporcionar, mantener y proteger el servicio, por ejemplo información relacionada con solicitudes, errores, seguridad y actividad dentro de la plataforma.</Paragraph>
      </Section>

      <Section title="4. Datos de transacciones">
        <Paragraph>Cuando realizas una transacción, Tokbid puede recibir o conservar información relacionada con la operación, como el identificador de la transacción, importe, estado y datos necesarios para asociar la operación con la funcionalidad correspondiente.</Paragraph>
        <Paragraph>Los datos de pago sensibles son procesados por el proveedor de pagos correspondiente según sus propias políticas y condiciones. Tokbid no afirma almacenar datos completos de tarjetas si esa funcionalidad no está implementada directamente en la plataforma.</Paragraph>
      </Section>

      <Section title="5. Cookies y tecnologías similares">
        <Paragraph>Tokbid puede utilizar cookies o tecnologías similares cuando sean necesarias para mantener sesiones, recordar preferencias, proteger el servicio o proporcionar determinadas funciones. No se declara el uso de herramientas analíticas o publicitarias específicas que no estén implementadas.</Paragraph>
      </Section>

      <Section title="6. Finalidades">
        <List>
          <li>Aplicar y mostrar correctamente tu puja en el ranking.</li>
          <li>Proporcionar las funciones de Tokbid.</li>
          <li>Procesar y verificar transacciones.</li>
          <li>Prevenir fraude, abuso y problemas de seguridad.</li>
          <li>Responder a solicitudes de soporte.</li>
          <li>Cumplir obligaciones legales cuando sean aplicables.</li>
          <li>Mejorar la estabilidad y funcionamiento del servicio.</li>
        </List>
      </Section>

      <Section title="7. Proveedores externos">
        <Paragraph>Tokbid puede utilizar proveedores externos para funciones necesarias para operar la plataforma. En el flujo de pagos actualmente integrado, Paddle participa como proveedor de procesamiento de pagos. Cualquier proveedor adicional utilizado en el futuro se incorporará a esta política cuando corresponda.</Paragraph>
      </Section>

      <Section title="8. Seguridad">
        <Paragraph>Aplicamos medidas técnicas y organizativas razonables para proteger la información frente a acceso no autorizado, pérdida, alteración o divulgación indebida. Ningún sistema conectado a Internet puede garantizar seguridad absoluta.</Paragraph>
      </Section>

      <Section title="9. Conservación">
        <Paragraph>Conservaremos los datos durante el tiempo necesario para proporcionar el servicio, cumplir obligaciones legales, resolver disputas, prevenir fraude y hacer cumplir nuestros acuerdos. Los periodos concretos dependerán del tipo de información y de las obligaciones aplicables.</Paragraph>
      </Section>

      <Section title="10. Derechos de los usuarios">
        <Paragraph>Dependiendo de la legislación aplicable, puedes tener derechos de acceso, rectificación, eliminación, limitación, oposición, portabilidad u otros derechos relacionados con tus datos personales. Para ejercerlos, contacta con <strong className="text-white">Raimundoevita96@gmail.com</strong>.</Paragraph>
      </Section>

      <Section title="11. Menores">
        <Paragraph>Tokbid no está diseñado para recopilar deliberadamente datos de menores cuando ello esté prohibido por la legislación aplicable. Si consideras que se ha recopilado información de un menor de forma indebida, contacta con nosotros.</Paragraph>
      </Section>

      <Section title="12. Cambios y contacto">
        <Paragraph>Podemos actualizar esta política cuando cambien el servicio, nuestras prácticas o las obligaciones legales aplicables. La versión vigente se publicará en esta página.</Paragraph>
        <Paragraph>Contacto de privacidad: <strong className="text-white">Raimundoevita96@gmail.com</strong>.</Paragraph>
      </Section>
    </LegalPage>
  );
}
