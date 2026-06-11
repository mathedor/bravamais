import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Como Funciona | BRAVA+",
  description: "Em poucos passos: assine, descubra parceiros, aproveite benefícios e economize com o BRAVA+.",
};

export default function ComoFuncionaPage() {
  return (
    <LegalShell
      title="Como Funciona"
      subtitle="Do cadastro ao desconto na mão, em poucos passos."
    >
      <LegalSection title="1. Crie sua conta">
        <p>
          Cadastre-se grátis em segundos. Você começa com um período de teste para conhecer os benefícios e
          os parceiros perto de você.
        </p>
      </LegalSection>

      <LegalSection title="2. Escolha seu plano">
        <p>
          Assine um plano completo ou pague só pelas categorias que usa (gastronomia, beleza, lazer e mais).
          O pagamento é por <strong>PIX</strong> (na hora) ou <strong>cartão</strong>, com Apple Pay e Google
          Pay disponíveis.
        </p>
      </LegalSection>

      <LegalSection title="3. Descubra parceiros">
        <p>
          Use o mapa e a busca para encontrar bares, restaurantes, lojas e serviços com vantagens. Veja
          ofertas, avaliações e o que está perto de você agora.
        </p>
      </LegalSection>

      <LegalSection title="4. Aproveite os benefícios">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Cupons:</strong> mostre o código no balcão e ganhe desconto.</li>
          <li><strong>Fidelidade:</strong> junte visitas e troque por recompensas.</li>
          <li><strong>Cashback:</strong> receba parte do valor de volta.</li>
          <li><strong>Vale-presente:</strong> presenteie quem você gosta.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Pague com a BRAVA Tag e a Wallet">
        <p>
          Carregue saldo com bônus na <strong>BRAVA Wallet</strong> ou ative a <strong>BRAVA Tag</strong> e
          pague em qualquer parceiro da rede como se fosse dinheiro — rápido, seguro e ainda com vantagens.
        </p>
      </LegalSection>

      <LegalSection title="6. Receba em casa">
        <p>
          Muitos parceiros oferecem <strong>delivery</strong>. Peça pelo app, acompanhe a entrega em tempo
          real e confirme com o código de 4 dígitos. Veja a{" "}
          <a href="/politica-de-entrega" className="font-bold text-brava-blue hover:underline">Política de Entrega</a>.
        </p>
      </LegalSection>

      <LegalSection title="É parceiro?">
        <p>
          Tenha um painel completo para promoções, fidelidade, vendas e relatórios.{" "}
          <a href="/seja-parceiro" className="font-bold text-brava-blue hover:underline">Cadastre seu negócio</a>{" "}
          e comece a atrair mais clientes.
        </p>
      </LegalSection>

      <div className="rounded-2xl border-2 border-brava-yellow bg-brava-yellow/10 p-6 text-center">
        <p className="text-lg font-black text-brava-ink">Pronto pra economizar?</p>
        <a
          href="/assinar"
          className="mt-3 inline-block rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
        >
          Ver planos
        </a>
      </div>
    </LegalShell>
  );
}
