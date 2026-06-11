import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Política de Entrega | BRAVA+",
  description: "Como funcionam as entregas e retiradas dos pedidos feitos pelo BRAVA+.",
};

export default function PoliticaEntregaPage() {
  return (
    <LegalShell
      title="Política de Entrega"
      subtitle="Como seus pedidos chegam até você — prazos, taxas e responsabilidades."
      updated="10 de junho de 2026"
    >
      <LegalSection title="1. Modalidades">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Entrega (delivery):</strong> um entregador leva o pedido até o endereço informado.</li>
          <li><strong>Retirada na loja (pickup):</strong> você busca o pedido no estabelecimento, sem taxa de entrega.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Área de cobertura e taxa">
        <p>
          A entrega está disponível conforme o raio de atendimento de cada estabelecimento. A taxa é
          calculada pela distância até o seu endereço e exibida no checkout antes da confirmação. Alguns
          parceiros oferecem <strong>frete grátis</strong> acima de um valor mínimo.
        </p>
      </LegalSection>

      <LegalSection title="3. Prazos">
        <p>
          O prazo estimado depende do preparo do parceiro e da distância. Você acompanha o status em tempo
          real no app (recebido → em preparo → a caminho → entregue), com rastreamento do entregador quando
          disponível.
        </p>
      </LegalSection>

      <LegalSection title="4. Confirmação de entrega">
        <p>
          Na entrega, você recebe um <strong>código de confirmação</strong> de 4 dígitos. Informe-o ao
          entregador para concluir o pedido com segurança. Isso garante que a entrega só seja finalizada
          por você.
        </p>
      </LegalSection>

      <LegalSection title="5. Endereço e disponibilidade">
        <p>
          Mantenha seu endereço e telefone atualizados. Se o entregador não conseguir contato ou acesso ao
          local, o pedido pode retornar ao estabelecimento. Reentregas podem gerar nova taxa.
        </p>
      </LegalSection>

      <LegalSection title="6. Problemas na entrega">
        <p>
          Pedido errado, incompleto ou com atraso excessivo? Acione o Suporte pelo app ou escreva para{" "}
          <a href="mailto:suporte@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            suporte@bravamais.com.br
          </a>. Tratamos a ocorrência junto ao parceiro. Veja também a{" "}
          <a href="/politica-de-reembolso" className="font-bold text-brava-blue hover:underline">
            Política de Reembolso e Devolução
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilidade">
        <p>
          O BRAVA+ conecta consumidores, estabelecimentos e entregadores. A preparação do produto é
          responsabilidade do estabelecimento, e o transporte, do entregador. Atuamos para que tudo
          funcione e mediamos eventuais conflitos.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
