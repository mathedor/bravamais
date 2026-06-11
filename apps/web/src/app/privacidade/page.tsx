import Link from "next/link";

export const metadata = { title: "Política de privacidade" };

export default function PrivacidadePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-black text-brava-ink">Privacidade · LGPD</h1>
      <p className="mt-2 text-sm text-brava-muted">Última atualização: 12 de maio de 2026.</p>

      <article className="mt-8 space-y-6 text-sm leading-relaxed text-brava-ink">
        <section>
          <h2 className="text-lg font-bold">1. Quem somos</h2>
          <p>
            BRAVA+ é um clube de vantagens. Tratamos seus dados de acordo com a Lei Geral de
            Proteção de Dados (LGPD — Lei 13.709/2018).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">2. Quais dados coletamos</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Cadastro: nome, email, telefone, CEP, data de nascimento (opcional)</li>
            <li>Uso: visitas escaneadas (QR), cupons usados, vale-presentes</li>
            <li>Localização (apenas quando você permite, para mostrar parceiros próximos)</li>
            <li>Dispositivo: user-agent + endpoint de push (quando você ativa)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold">3. Para que usamos</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Operar o clube (cupons, fidelidade, vale-presentes)</li>
            <li>Personalizar parceiros próximos e promoções relevantes</li>
            <li>Cobrança da assinatura e suporte</li>
            <li>Combater fraude</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold">4. Compartilhamento</h2>
          <p>
            Compartilhamos com: Supabase (banco), SyncPay (PIX) e Stripe (cartão) para pagamentos,
            Resend (emails), OpenStreetMap/Mapbox (mapa). Não vendemos seus dados.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">5. Seus direitos (LGPD)</h2>
          <p>Você tem direito a:</p>
          <ul className="ml-5 list-disc space-y-1">
            <li>Acessar e corrigir seus dados (em /app/perfil)</li>
            <li>Exportar todos os seus dados (em /app/perfil/dados)</li>
            <li>Solicitar exclusão da conta (efetivada em 7 dias)</li>
            <li>Revogar consentimento de geolocalização e notificações a qualquer momento</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold">6. Contato do encarregado</h2>
          <p>
            Para questões de privacidade: <a className="text-brava-blue underline" href="mailto:privacidade@bravamais.app">privacidade@bravamais.app</a>
          </p>
        </section>
      </article>

      <p className="mt-10 text-sm">
        <Link href="/termos" className="text-brava-blue hover:underline">Ver termos de uso →</Link>
      </p>
    </div>
  );
}
