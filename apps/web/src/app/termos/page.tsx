import Link from "next/link";

export const metadata = { title: "Termos de uso" };

export default function TermosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-black text-brava-ink">Termos de uso · BRAVA+</h1>
      <p className="mt-2 text-sm text-brava-muted">Última atualização: 12 de maio de 2026.</p>

      <article className="mt-8 space-y-6 text-sm leading-relaxed text-brava-ink">
        <section>
          <h2 className="text-lg font-bold">1. Aceitação</h2>
          <p>
            Ao usar o BRAVA+, você concorda com estes termos e nossa política de privacidade.
            Caso não concorde, encerre o uso da plataforma.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">2. Cadastro e conta</h2>
          <p>
            Você deve fornecer informações verdadeiras e manter sua senha protegida. Você é
            responsável por toda atividade na sua conta.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">3. Assinatura</h2>
          <p>
            A assinatura BRAVA+ dá direito a benefícios conforme o tier contratado. Cobrança via
            Efí Bank (PIX ou cartão). Você pode cancelar a qualquer momento — o benefício continua
            até o fim do período pago.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">4. Cupons, vale-presentes e fidelidade</h2>
          <p>
            Vantagens são oferecidas pelos estabelecimentos parceiros. O BRAVA+ apenas intermedia.
            Validade, regras e disponibilidade são responsabilidade do estabelecimento.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">5. Conduta proibida</h2>
          <p>
            É proibido: fraude (multiplas contas, check-ins falsos), revenda de cupons,
            engenharia reversa, automação não autorizada, conteúdo ilegal ou ofensivo.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">6. Encerramento</h2>
          <p>
            Podemos suspender contas que violem estes termos. Você pode encerrar sua conta a
            qualquer momento em /app/perfil/dados.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold">7. Limitação de responsabilidade</h2>
          <p>
            O BRAVA+ não é responsável pela qualidade dos produtos/serviços dos estabelecimentos.
            Disputas devem ser resolvidas via tickets de extorno.
          </p>
        </section>
      </article>

      <p className="mt-10 text-sm">
        <Link href="/privacidade" className="text-brava-blue hover:underline">Ver política de privacidade →</Link>
      </p>
    </div>
  );
}
