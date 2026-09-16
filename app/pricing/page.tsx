import type { Metadata } from "next";
import LegalPage, { Paragraph, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Precios | Tokbid",
  description: "Información sobre precios, transacciones y comisiones de Tokbid.",
};

export default function PricingPage() {
  return (
    <LegalPage title="Precios" updated="15 de septiembre de 2026">
      <Section title="Cómo funciona Tokbid">
        <Paragraph>
          Tokbid es una plataforma web que permite a los usuarios apoyar económicamente a creadores mediante un sistema de pujas. Los usuarios pueden realizar una puja sobre el perfil de un creador y completar el pago cuando corresponda.
        </Paragraph>
      </Section>

      <Section title="Costes y comisiones">
        <Paragraph>
          Tokbid obtiene ingresos mediante una comisión sobre las transacciones realizadas a través de la plataforma. Las tarifas aplicables pueden depender de la transacción y de la configuración vigente del servicio.
        </Paragraph>
        <Paragraph>
          Actualmente no se publica en esta página un precio fijo o porcentaje que no esté confirmado en la aplicación. Cualquier tarifa aplicable se mostrará claramente al usuario antes de confirmar el pago.
        </Paragraph>
      </Section>

      <Section title="Pago">
        <Paragraph>
          Antes de completar una transacción, el usuario podrá revisar el importe que se le cobrará y la información relevante disponible en el proceso de pago.
        </Paragraph>
        <Paragraph>
          Los costes que pueda aplicar un proveedor de servicios de pago, cuando correspondan y sean comunicados al usuario, pueden estar sujetos a las condiciones de dicho proveedor.
        </Paragraph>
      </Section>

      <Section title="Cambios en las tarifas">
        <Paragraph>
          Tokbid podrá modificar sus tarifas cuando resulte necesario. Las tarifas aplicables a una transacción se comunicarán al usuario antes de que este confirme el pago.
        </Paragraph>
      </Section>

      <Section title="Contacto">
        <Paragraph>
          Para preguntas sobre precios o transacciones, utiliza el canal de contacto disponible en Tokbid o escribe a <strong className="text-white">Raimundoevita96@gmail.com</strong>.
        </Paragraph>
      </Section>
    </LegalPage>
  );
}
