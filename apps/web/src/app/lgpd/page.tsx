import { LegalShell, LegalSection } from "@/components/legal/legal-shell";

export const metadata = {
  title: "LGPD — Proteção de Dados | BRAVA+",
  description: "Como o BRAVA+ trata seus dados pessoais conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).",
};

export default function LgpdPage() {
  return (
    <LegalShell
      title="LGPD — Proteção de Dados"
      subtitle="Transparência total sobre como coletamos, usamos e protegemos seus dados pessoais."
      updated="10 de junho de 2026"
    >
      <p>
        O BRAVA+ leva a privacidade a sério. Esta página explica, em linguagem simples, como tratamos
        seus dados de acordo com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>.
      </p>

      <LegalSection title="1. Quem é o controlador dos dados">
        <p>
          O BRAVA+ é o controlador dos dados pessoais coletados na plataforma. Para qualquer assunto
          relacionado a dados, fale com nosso Encarregado (DPO) pelo e-mail{" "}
          <a href="mailto:privacidade@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            privacidade@bravamais.com.br
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados coletamos">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Cadastro:</strong> nome, e-mail, telefone, CPF e senha.</li>
          <li><strong>Localização:</strong> com sua permissão, para mostrar parceiros próximos.</li>
          <li><strong>Uso:</strong> cupons resgatados, visitas, pedidos, favoritos e histórico.</li>
          <li><strong>Pagamento:</strong> dados de transação processados pelos parceiros de pagamento (não armazenamos número de cartão).</li>
          <li><strong>Técnicos:</strong> dispositivo, navegador e endereço IP, para segurança e antifraude.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Para que usamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Operar sua conta, assinatura e benefícios.</li>
          <li>Processar pagamentos via PIX e cartão com segurança.</li>
          <li>Mostrar parceiros, ofertas e recomendações relevantes.</li>
          <li>Enviar avisos importantes e, com seu consentimento, comunicações de marketing.</li>
          <li>Prevenir fraude e cumprir obrigações legais.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Bases legais">
        <p>
          Tratamos dados com fundamento na <strong>execução do contrato</strong> (sua assinatura e uso),
          no <strong>consentimento</strong> (localização e marketing), no <strong>legítimo interesse</strong>{" "}
          (segurança e melhoria do serviço) e no <strong>cumprimento de obrigação legal</strong>.
        </p>
      </LegalSection>

      <LegalSection title="5. Compartilhamento">
        <p>
          Compartilhamos dados apenas com quem é necessário para o serviço funcionar: estabelecimentos
          parceiros (para validar benefícios), processadores de pagamento (SyncPay para PIX e Stripe para
          cartão), provedores de nuvem e ferramentas de comunicação. Nunca vendemos seus dados.
        </p>
      </LegalSection>

      <LegalSection title="6. Seus direitos">
        <p>A LGPD garante a você o direito de, a qualquer momento:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirmar a existência de tratamento e acessar seus dados.</li>
          <li>Corrigir dados incompletos ou desatualizados.</li>
          <li>Solicitar anonimização, bloqueio ou eliminação.</li>
          <li>Solicitar a portabilidade.</li>
          <li>Revogar o consentimento e solicitar a exclusão da conta.</li>
        </ul>
        <p>
          Você pode exercer esses direitos no app (Perfil → Privacidade) ou pelo e-mail{" "}
          <a href="mailto:privacidade@bravamais.com.br" className="font-bold text-brava-blue hover:underline">
            privacidade@bravamais.com.br
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="7. Segurança e retenção">
        <p>
          Usamos criptografia, controle de acesso e monitoramento. Mantemos seus dados apenas pelo tempo
          necessário para as finalidades acima ou conforme exigido por lei. Após esse prazo, eles são
          eliminados ou anonimizados.
        </p>
      </LegalSection>

      <LegalSection title="8. Alterações">
        <p>
          Podemos atualizar esta política. Mudanças relevantes serão comunicadas pelo app ou por e-mail.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
