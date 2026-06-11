import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Política de Reembolso e Devolução | BRAVA+",
  description: "Direito de arrependimento, estornos e devoluções no BRAVA+, conforme o Código de Defesa do Consumidor.",
};

export default function PoliticaReembolsoPage() {
  return (
    <LegalShell
      title="Política de Reembolso e Devolução"
      subtitle="Seus direitos de estorno, devolução e arrependimento — claros e dentro da lei."
      updated="10 de junho de 2026"
    >
      <LegalSection title="1. Direito de arrependimento (7 dias)">
        <p>
          Conforme o <strong>art. 49 do Código de Defesa do Consumidor</strong>, você pode desistir de uma
          compra feita pela internet em até <strong>7 (sete) dias corridos</strong> a partir da contratação,
          desde que o serviço/benefício ainda não tenha sido utilizado. Nesse caso, o valor é devolvido
          integralmente.
        </p>
      </LegalSection>

      <LegalSection title="2. Assinaturas BRAVA+">
        <p>
          Você pode cancelar a assinatura a qualquer momento. O cancelamento interrompe as próximas
          cobranças e o benefício continua ativo até o fim do período já pago. Não há reembolso
          proporcional de período já usufruído, salvo no prazo de arrependimento de 7 dias.
        </p>
      </LegalSection>

      <LegalSection title="3. Recargas, Wallet e Tag">
        <p>
          Saldos de BRAVA Wallet e BRAVA Tag (incluindo bônus) podem ser usados em qualquer parceiro. O
          valor depositado (excluindo bônus promocional) pode ser solicitado de volta enquanto não tiver
          sido gasto, dentro do prazo de arrependimento. Bônus promocionais não são reembolsáveis em
          dinheiro.
        </p>
      </LegalSection>

      <LegalSection title="4. Pedidos e entregas">
        <p>
          Para pedidos de produtos dos parceiros, a devolução segue o CDC: produto com defeito ou em
          desacordo com o anunciado pode ser trocado ou reembolsado. Como o BRAVA+ intermedia a venda, a
          solicitação é tratada junto ao estabelecimento parceiro, com nosso suporte.
        </p>
      </LegalSection>

      <LegalSection title="5. Vale-presentes">
        <p>
          Vale-presentes não utilizados podem ser cancelados dentro do prazo de arrependimento de 7 dias.
          Após o uso (total ou parcial), não há reembolso do valor já consumido.
        </p>
      </LegalSection>

      <LegalSection title="6. Como pedir o reembolso">
        <ul className="list-disc space-y-1 pl-5">
          <li>Solicite pelo app (Suporte) ou pelo e-mail <a href="mailto:reembolso@bravamais.com.br" className="font-bold text-brava-blue hover:underline">reembolso@bravamais.com.br</a>.</li>
          <li>Informe seu CPF, o pagamento e o motivo.</li>
          <li>Analisamos em até 5 dias úteis.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Prazos e forma do estorno">
        <p>
          Reembolsos no <strong>PIX</strong> são feitos para a mesma chave/conta de origem, normalmente em
          até 5 dias úteis após a aprovação. Reembolsos no <strong>cartão</strong> são estornados pela
          operadora e aparecem na fatura conforme o ciclo do seu emissor (pode levar de 1 a 2 faturas).
        </p>
      </LegalSection>
    </LegalShell>
  );
}
