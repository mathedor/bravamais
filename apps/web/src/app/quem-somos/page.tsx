import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Quem Somos | BRAVA+",
  description: "Conheça o BRAVA+ — o clube de vantagens que conecta você aos melhores parceiros da sua cidade.",
};

export default function QuemSomosPage() {
  return (
    <LegalShell
      title="Quem Somos"
      subtitle="O BRAVA+ é o clube de vantagens que faz seu dinheiro render mais nos lugares que você ama."
    >
      <LegalSection title="Nossa missão">
        <p>
          Acreditamos que aproveitar a cidade não precisa custar caro. O BRAVA+ reúne cupons, fidelidade,
          cashback, vale-presentes e uma carteira digital em um só app — para você economizar de verdade nos
          bares, restaurantes, lojas e serviços que já fazem parte da sua rotina.
        </p>
      </LegalSection>

      <LegalSection title="O que fazemos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Conectamos <strong>consumidores</strong> a benefícios reais nos parceiros locais.</li>
          <li>Ajudamos <strong>estabelecimentos</strong> a atrair e fidelizar clientes com ferramentas simples.</li>
          <li>Movimentamos a economia local com a <strong>BRAVA Tag</strong> e a <strong>BRAVA Wallet</strong>, que valem como dinheiro na rede.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Para o consumidor">
        <p>
          Uma assinatura flexível: escolha o plano ou pague só pelas categorias que você usa. Tenha acesso a
          descontos, junte pontos, ganhe cashback e presenteie quem você gosta — tudo no mesmo lugar.
        </p>
      </LegalSection>

      <LegalSection title="Para o parceiro">
        <p>
          Um painel completo para criar promoções, clube de fidelidade, vale-presentes e acompanhar
          resultados em tempo real. Sem complicação, com pagamento via PIX e cartão integrados.
        </p>
      </LegalSection>

      <LegalSection title="Nossos valores">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Transparência:</strong> regras claras, sem letra miúda.</li>
          <li><strong>Economia real:</strong> benefício que cabe no bolso.</li>
          <li><strong>Local em primeiro lugar:</strong> fortalecer o comércio da sua cidade.</li>
          <li><strong>Segurança:</strong> seus dados e pagamentos protegidos.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Vem com a gente">
        <p>
          Quer aproveitar?{" "}
          <a href="/assinar" className="font-bold text-brava-blue hover:underline">Conheça os planos</a>. É
          parceiro?{" "}
          <a href="/seja-parceiro" className="font-bold text-brava-blue hover:underline">Cadastre seu negócio</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
