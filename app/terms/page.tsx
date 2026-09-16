import type { Metadata } from "next";
import LegalPage, { List, Paragraph, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Condiciones de servicio | Tokbid",
  description: "Condiciones de servicio de la plataforma Tokbid.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Condiciones de servicio" updated="15 de septiembre de 2026">
      <Section title="1. Información general">
        <Paragraph>
          Estas Condiciones de Servicio regulan el acceso y uso de Tokbid, una plataforma web que permite a los usuarios apoyar económicamente a creadores mediante un sistema de pujas.
        </Paragraph>
        <Paragraph>
          El operador del servicio es <strong className="text-white">tokbid</strong>, con domicilio en <strong className="text-white">Guinea Ecuatorial</strong>. Si la información legal del operador cambia, esta sección se actualizará.
        </Paragraph>
      </Section>

      <Section title="2. Aceptación">
        <Paragraph>Al utilizar Tokbid aceptas estas condiciones y las políticas publicadas en el sitio. Si no estás de acuerdo, no debes utilizar el servicio.</Paragraph>
      </Section>

      <Section title="3. Uso del servicio">
        <Paragraph>Tokbid no requiere crear una cuenta. Para pujar, el usuario proporciona un nombre que se mostrará públicamente junto a su puja en el ranking. El usuario es responsable de la veracidad de ese nombre y de la actividad que realice al pujar.</Paragraph>
        <Paragraph>Tokbid podrá establecer requisitos de edad o de uso cuando sean necesarios para cumplir la legislación aplicable o las reglas de los proveedores de pago.</Paragraph>
      </Section>

      <Section title="4. Sistema de pujas">
        <Paragraph>Tokbid permite realizar pujas asociadas a creadores. Una puja puede afectar a la posición o importe mostrado en la plataforma según la lógica vigente del servicio.</Paragraph>
        <Paragraph>El sistema debe utilizarse de buena fe. Una puja no debe realizarse mediante información falsa, manipulación técnica, automatización abusiva o métodos destinados a perjudicar a otros usuarios.</Paragraph>
      </Section>

      <Section title="5. Pagos y transacciones">
        <Paragraph>Cuando una acción requiera pago, el usuario podrá revisar el importe aplicable antes de confirmarlo. Las transacciones pueden ser procesadas mediante proveedores externos de pago.</Paragraph>
        <Paragraph>Tokbid puede obtener una comisión sobre las transacciones realizadas a través de la plataforma. Las tarifas aplicables se comunicarán antes de la confirmación del pago.</Paragraph>
      </Section>

      <Section title="6. Responsabilidades del usuario">
        <List>
          <li>Utilizar Tokbid de acuerdo con estas condiciones y la legislación aplicable.</li>
          <li>No intentar acceder a cuentas, datos o sistemas sin autorización.</li>
          <li>No interferir con el funcionamiento, seguridad o disponibilidad de la plataforma.</li>
          <li>No utilizar la plataforma para actividades ilícitas, fraudulentas o engañosas.</li>
          <li>Mantener actualizada y veraz la información que proporciones al pujar.</li>
        </List>
      </Section>

      <Section title="7. Conductas prohibidas">
        <Paragraph>Está prohibido utilizar Tokbid para fraude, suplantación de identidad, manipulación deliberada del sistema, abuso de promociones o pagos, distribución de contenido ilegal, infracción de derechos de terceros o cualquier actividad que pueda causar daños a la plataforma o a otros usuarios.</Paragraph>
      </Section>

      <Section title="8. Contenido de los usuarios">
        <Paragraph>Los usuarios pueden publicar información o contenido cuando las funciones de Tokbid lo permitan. El usuario conserva los derechos que le correspondan sobre su contenido, pero declara que tiene derecho a publicarlo y que no infringe la ley ni derechos de terceros.</Paragraph>
      </Section>

      <Section title="9. Propiedad intelectual">
        <Paragraph>Tokbid, su software, marca, diseño y contenido propio están protegidos por las leyes aplicables. Salvo autorización expresa, no se permite copiar, modificar, distribuir o explotar comercialmente estos elementos fuera de los usos permitidos por la plataforma.</Paragraph>
      </Section>

      <Section title="10. Suspensión o cancelación">
        <Paragraph>Tokbid podrá limitar, suspender o bloquear la participación de un usuario en la plataforma cuando existan motivos razonables relacionados con incumplimientos de estas condiciones, fraude, seguridad, obligaciones legales o abuso del servicio.</Paragraph>
      </Section>

      <Section title="11. Disponibilidad y cambios">
        <Paragraph>Tokbid puede actualizar, modificar, suspender o retirar determinadas funciones del servicio. Procuraremos mantener la plataforma disponible, pero no garantizamos disponibilidad ininterrumpida.</Paragraph>
      </Section>

      <Section title="12. Limitación de responsabilidad">
        <Paragraph>En la medida permitida por la legislación aplicable, Tokbid no será responsable de pérdidas indirectas, interrupciones causadas por terceros, fallos de redes externas o circunstancias fuera de su control. Nada de esta sección limita derechos que legalmente no puedan excluirse.</Paragraph>
      </Section>

      <Section title="13. Modificaciones de estas condiciones">
        <Paragraph>Podemos actualizar estas condiciones para reflejar cambios en el servicio, requisitos legales o necesidades operativas. La versión publicada en esta página será la versión vigente.</Paragraph>
      </Section>

      <Section title="14. Ley aplicable y jurisdicción">
        <Paragraph>Estas condiciones se regirán por <strong className="text-white">Las leyes de Guinea Ecuatorial</strong> y cualquier controversia estará sujeta a <strong className="text-white">los tribunales de Guinea Ecuatorial</strong>, salvo que la legislación aplicable disponga otra cosa.</Paragraph>
      </Section>

      <Section title="15. Contacto">
        <Paragraph>Para cuestiones relacionadas con estas condiciones: <strong className="text-white">Raimundoevita96@gmail.com</strong>.</Paragraph>
      </Section>
    </LegalPage>
  );
}
