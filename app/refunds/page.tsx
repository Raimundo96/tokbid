import type { Metadata } from "next";
import LegalPage, { List, Paragraph, Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de reembolso | Tokbid",
  description: "Política de reembolsos y solicitudes relacionadas con transacciones de Tokbid.",
};

export default function RefundsPage() {
  return (
    <LegalPage title="Política de reembolso" updated="15 de septiembre de 2026">
      <Section title="1. Información general">
        <Paragraph>Esta política explica cómo solicitar un reembolso relacionado con una transacción realizada a través de Tokbid. Los derechos legales obligatorios del consumidor se mantienen cuando sean aplicables.</Paragraph>
      </Section>

      <Section title="2. Cuándo puedes solicitar un reembolso">
        <Paragraph>Puedes contactar con Tokbid cuando consideres que una transacción debe revisarse, por ejemplo si el pago se realizó por error, si se produjo un problema técnico que afectó a la transacción o si existe otra circunstancia que justifique la revisión.</Paragraph>
        <Paragraph>Cada solicitud se evaluará teniendo en cuenta la información disponible, el estado de la transacción y las normas aplicables.</Paragraph>
      </Section>

      <Section title="3. Cómo solicitarlo">
        <Paragraph>Envía tu solicitud a <strong className="text-white">Raimundoevita96@gmail.com</strong> indicando, cuando sea posible:</Paragraph>
        <List>
          <li>Nombre utilizado en Tokbid.</li>
          <li>Fecha aproximada de la transacción.</li>
          <li>Importe de la transacción.</li>
          <li>Identificador de la transacción, si está disponible.</li>
          <li>Motivo de la solicitud.</li>
        </List>
      </Section>

      <Section title="4. Revisión de solicitudes">
        <Paragraph>Tokbid podrá solicitar información adicional para verificar la transacción. Una solicitud puede rechazarse cuando no exista una base válida para el reembolso, cuando la información proporcionada sea insuficiente o cuando el reembolso no sea posible conforme a la legislación o a las reglas aplicables al pago.</Paragraph>
      </Section>

      <Section title="5. Procesamiento de reembolsos">
        <Paragraph>Cuando se apruebe un reembolso, se intentará devolver el importe mediante el método de pago utilizado o mediante el procedimiento disponible para esa transacción.</Paragraph>
        <Paragraph>El tiempo necesario para que los fondos aparezcan en la cuenta del usuario puede depender del proveedor de pagos y de la entidad financiera. No se publica un plazo fijo cuando todavía no está definido.</Paragraph>
      </Section>

      <Section title="6. Derechos legales">
        <Paragraph>Nada de esta política pretende excluir o limitar derechos de reembolso, desistimiento o protección del consumidor que sean obligatorios conforme a la legislación aplicable.</Paragraph>
      </Section>

      <Section title="7. Contacto">
        <Paragraph>Para solicitudes de reembolso: <strong className="text-white">Raimundoevita96@gmail.com</strong>.</Paragraph>
      </Section>
    </LegalPage>
  );
}
