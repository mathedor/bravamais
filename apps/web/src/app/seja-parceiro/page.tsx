import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Seja parceiro",
  description: "Coloque seu estabelecimento no clube BRAVA+ e atraia clientes fiéis.",
};

export default function SejaParceiroPage() {
  return (
    <main className="flex-1">
      <header className="sticky top-0 z-30 border-b border-brava-border bg-brava-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="inline-flex">
            <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} priority />
          </Link>
          <Link
            href="/"
            className="text-sm text-white/80 hover:text-white"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-brava-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -right-32 top-0 h-[520px] w-[520px] rounded-full bg-brava-yellow blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-brava-blue-bright blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brava-yellow">
            Estabelecimentos parceiros
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight md:text-6xl">
            Encha seu salão com clientes que <span className="text-brava-yellow">já querem voltar</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 md:text-xl">
            Os assinantes BRAVA+ procuram lugares pra usar suas vantagens. Coloque sua loja no clube e seja descoberto por quem está pronto pra consumir.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/cadastro-estabelecimento"
              className="inline-flex items-center rounded-full bg-brava-yellow px-7 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.02]"
            >
              Cadastrar agora
            </Link>
            <a
              href="#beneficios"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
            >
              Ver benefícios
            </a>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">O que você ganha</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            Ferramentas pra atrair, fidelizar e crescer
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Vitrine completa", d: "Foto, descrição, catálogo, contato, mapa — tudo num perfil profissional." },
              { t: "Cupons sob demanda", d: "Crie cupons sazonais, exclusivos pra assinantes ou pra estreantes." },
              { t: "Clube de fidelidade próprio", d: "Defina X visitas = brinde Y. Sem programa caro, sem complicação." },
              { t: "Vale-presente e cashback", d: "Use como reativação, datas comemorativas ou ações sazonais." },
              { t: "Catálogo + checkout online", d: "Receba pedidos com PIX ou cartão. Cliente paga, você manda." },
              { t: "Chat direto com o cliente", d: "Tira dúvida, agenda, vende. Sem intermediário." },
              { t: "Validação por QR", d: "Lê a carteirinha do assinante na entrada e marca a visita." },
              { t: "Dashboard com seus dados", d: "Quem visita, quando, melhores produtos, melhores cupons." },
              { t: "Sem mensalidade pra começar", d: "A gente cresce junto. Cobramos só por engajamento real." },
            ].map((b) => (
              <article key={b.t} className="rounded-3xl border border-brava-border bg-brava-paper p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brava-yellow text-brava-blue">
                  <span className="text-2xl font-black">+</span>
                </div>
                <h3 className="text-lg font-bold text-brava-ink">{b.t}</h3>
                <p className="mt-2 text-sm text-brava-muted">{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brava-paper py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Como funciona</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            Em 4 passos você está no ar
          </h2>

          <ol className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: 1, t: "Fale com a gente", d: "WhatsApp ou formulário. Nosso comercial te liga." },
              { n: 2, t: "Cadastro guiado", d: "Foto, catálogo, contato, configurar cupom e fidelidade." },
              { n: 3, t: "Aprovação rápida", d: "Verificamos os dados e você entra no ar em 24h úteis." },
              { n: 4, t: "Comece a receber clientes", d: "Sua loja no mapa. Cliente chega, mostra carteirinha, vira fiel." },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border border-brava-border bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brava-black text-brava-yellow">
                  <span className="text-xl font-black">{s.n}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-brava-ink">{s.t}</h3>
                <p className="mt-2 text-sm text-brava-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-brava-black py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-5xl">
            Pronto pra encher sua loja?
          </h2>
          <p className="mt-4 text-lg text-white/75">
            Cadastro rápido. Comercial dedicado. Você não fica perdido em nenhum momento.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/cadastro-estabelecimento"
              className="inline-flex items-center rounded-full bg-brava-yellow px-7 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.02]"
            >
              Cadastrar minha loja
            </Link>
            <a
              href="https://wa.me/5511999998888?text=Quero%20cadastrar%20meu%20estabelecimento%20no%20BRAVA%2B"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
