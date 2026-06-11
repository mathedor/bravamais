import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "Política de Uso | BRAVA+",
  description: "Regras de uso aceitável da plataforma BRAVA+.",
};

export default function PoliticaUsoPage() {
  return (
    <LegalShell
      title="Política de Uso"
      subtitle="As regras para um uso justo e seguro do BRAVA+ por todos."
      updated="10 de junho de 2026"
    >
      <p>
        Esta política complementa os{" "}
        <a href="/termos" className="font-bold text-brava-blue hover:underline">Termos de Uso</a> e define o
        que é permitido e o que não é na plataforma.
      </p>

      <LegalSection title="1. Quem pode usar">
        <p>
          O BRAVA+ é para maiores de 18 anos com cadastro válido. Você é responsável por manter seus dados
          corretos e sua senha em segurança. A conta é pessoal e intransferível.
        </p>
      </LegalSection>

      <LegalSection title="2. Uso correto dos benefícios">
        <ul className="list-disc space-y-1 pl-5">
          <li>Cupons, vale-presentes, fidelidade e cashback são para uso pessoal e de boa-fé.</li>
          <li>Respeite as regras, validade e limites de cada benefício, definidos pelo parceiro.</li>
          <li>Saldos de Wallet e Tag não podem ser revendidos ou transferidos fora das funções do app.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Condutas proibidas">
        <ul className="list-disc space-y-1 pl-5">
          <li>Fraudar benefícios, criar contas falsas ou múltiplas para burlar limites.</li>
          <li>Usar dados de pagamento de terceiros sem autorização.</li>
          <li>Tentar invadir, sobrecarregar ou explorar falhas da plataforma.</li>
          <li>Publicar conteúdo ofensivo, ilegal ou que viole direitos de terceiros.</li>
          <li>Usar a plataforma para spam, golpes ou atividades ilícitas.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Conteúdo do usuário">
        <p>
          Avaliações, fotos e mensagens enviadas por você devem ser verdadeiras e respeitosas. Podemos
          remover conteúdo que viole estas regras ou a lei.
        </p>
      </LegalSection>

      <LegalSection title="5. Antifraude">
        <p>
          Monitoramos atividades suspeitas para proteger usuários e parceiros. Em caso de indício de
          fraude, podemos suspender benefícios, reter valores sob análise ou bloquear a conta.
        </p>
      </LegalSection>

      <LegalSection title="6. Suspensão e encerramento">
        <p>
          O descumprimento desta política pode levar à advertência, suspensão ou encerramento da conta,
          sem prejuízo das medidas legais cabíveis. Você também pode encerrar sua conta quando quiser.
        </p>
      </LegalSection>

      <LegalSection title="7. Contato">
        <p>
          Dúvidas ou denúncias de mau uso:{" "}
          <a href="mailto:suporte@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            suporte@bravamais.com.br
          </a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
