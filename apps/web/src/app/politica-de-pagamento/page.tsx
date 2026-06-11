import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Política de Pagamento | BRAVA+",
  description: "Como funcionam os pagamentos no BRAVA+: PIX, cartão, Apple Pay, Google Pay e segurança.",
};

export default function PoliticaPagamentoPage() {
  return (
    <LegalShell
      title="Política de Pagamento"
      subtitle="Tudo sobre como você paga no BRAVA+ — com segurança e sem surpresas."
      updated="10 de junho de 2026"
    >
      <LegalSection title="1. Formas de pagamento">
        <p>O BRAVA+ aceita:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>PIX</strong> — aprovação na hora, processado pela SyncPay.</li>
          <li><strong>Cartão de crédito</strong> — processado pela Stripe, com opção de parcelamento.</li>
          <li><strong>Apple Pay e Google Pay</strong> — pagamento por aproximação, direto no navegador.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. O que você pode pagar">
        <ul className="list-disc space-y-1 pl-5">
          <li>Assinatura BRAVA+ (mensal, por plano ou por categorias).</li>
          <li>Recarga e plano mensal da BRAVA Tag.</li>
          <li>Depósitos na BRAVA Wallet (com bônus).</li>
          <li>Pedidos e entregas dos parceiros.</li>
          <li>Vale-presentes.</li>
          <li>Planos de loja (para estabelecimentos parceiros).</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Segurança">
        <p>
          Não armazenamos os dados do seu cartão. As transações são feitas em ambiente criptografado e
          certificado (PCI-DSS) pelos nossos processadores de pagamento. Para o PIX, geramos um QR Code e
          código copia-e-cola exclusivos para cada cobrança.
        </p>
      </LegalSection>

      <LegalSection title="4. Confirmação">
        <p>
          O pagamento por PIX costuma ser confirmado em segundos. No cartão, a aprovação depende do
          emissor. Assim que confirmado, o benefício, saldo ou pedido é liberado automaticamente e você
          recebe uma notificação.
        </p>
      </LegalSection>

      <LegalSection title="5. Assinaturas e renovação">
        <p>
          Assinaturas são cobradas por período (mensal). O acesso vale até o fim do período pago. Você
          pode cancelar a qualquer momento, sem multa — o benefício continua até o término do ciclo já
          pago. Não há fidelidade.
        </p>
      </LegalSection>

      <LegalSection title="6. Parcelamento e taxas">
        <p>
          Compras no cartão podem ser parceladas conforme as condições exibidas no checkout. Eventuais
          juros de parcelamento são informados antes da confirmação. O PIX é sempre à vista.
        </p>
      </LegalSection>

      <LegalSection title="7. Problemas com pagamento">
        <p>
          Se o valor foi debitado e o benefício não liberou, aguarde alguns minutos — a confirmação pode
          demorar. Persistindo, fale com{" "}
          <a href="mailto:pagamentos@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            pagamentos@bravamais.com.br
          </a>{" "}
          com o comprovante. Veja também nossa{" "}
          <a href="/politica-de-reembolso" className="font-bold text-brava-blue hover:underline">
            Política de Reembolso e Devolução
          </a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
