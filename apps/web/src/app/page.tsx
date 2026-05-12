import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-brava-black text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-32 -right-24 h-[480px] w-[480px] rounded-full bg-brava-yellow blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-[520px] w-[520px] rounded-full bg-brava-blue-bright blur-3xl" />
        </div>

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Image
            src="/logo-dark.svg"
            alt="BRAVA+"
            width={180}
            height={66}
            priority
          />
          <nav className="hidden gap-8 text-sm font-medium text-white/80 md:flex">
            <a href="#beneficios" className="hover:text-white">Benefícios</a>
            <a href="#estabelecimentos" className="hover:text-white">Estabelecimentos</a>
            <a href="#planos" className="hover:text-white">Planos</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/entrar"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/90 hover:text-white sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              href="/assinar"
              className="inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black shadow-lg shadow-brava-yellow/20 transition-transform hover:scale-[1.02]"
            >
              Assinar agora
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_1fr] md:py-32">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brava-yellow">
              Clube de vantagens
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Descontos, cupons e fidelidade <span className="text-brava-yellow">em um só lugar</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80 md:text-xl">
              Assine o BRAVA+ e ganhe benefícios reais nos seus estabelecimentos favoritos.
              Cupons, vale-presente, clube de fidelidade e carteirinha digital com QR code &mdash; tudo no mesmo app.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/assinar"
                className="inline-flex items-center rounded-full bg-brava-yellow px-7 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.02]"
              >
                Quero assinar
              </Link>
              <Link
                href="#estabelecimentos"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
              >
                Ver estabelecimentos
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-6 text-sm text-white/60">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-brava-yellow ring-2 ring-brava-black" />
                <div className="h-8 w-8 rounded-full bg-brava-blue-bright ring-2 ring-brava-black" />
                <div className="h-8 w-8 rounded-full bg-white ring-2 ring-brava-black" />
              </div>
              <span>Em breve · cadastre-se na lista de espera</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute h-96 w-96 rounded-full bg-gradient-to-br from-brava-yellow/40 via-transparent to-brava-blue/40 blur-3xl" />
            <div className="relative">
              <Image
                src="/logo-mark.svg"
                alt=""
                width={420}
                height={420}
                priority
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
          O que você ganha sendo BRAVA+
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-brava-muted">
          Vantagens combinadas que se acumulam toda vez que você visita ou compra.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { titulo: "Cupons de desconto", texto: "Códigos exclusivos aplicados direto no checkout do estabelecimento parceiro." },
            { titulo: "Vale-presente", texto: "Ganhe créditos que viram presente em datas comemorativas." },
            { titulo: "Clube de fidelidade", texto: "Cada visita ou compra conta. Atingiu o objetivo, ganhou o prêmio." },
            { titulo: "Carteirinha QR", texto: "Mostre seu QR no balcão e o estabelecimento valida sua visita na hora." },
          ].map((b) => (
            <article
              key={b.titulo}
              className="group rounded-3xl border border-brava-border bg-white p-7 transition hover:border-brava-yellow hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brava-yellow text-brava-blue">
                <span className="text-2xl font-black">+</span>
              </div>
              <h3 className="text-lg font-bold text-brava-ink">{b.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brava-muted">{b.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="planos" className="border-t border-brava-border bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            Escolha seu nível
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-brava-muted">
            Três planos pra você começar do jeito que combina com sua rotina.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                nome: "Básico",
                preco: "Em breve",
                tag: "Pra começar",
                bullets: ["Acesso à lista de estabelecimentos", "Cupons básicos", "Clube de fidelidade"],
                destaque: false,
              },
              {
                nome: "Premium",
                preco: "Em breve",
                tag: "Mais popular",
                bullets: ["Tudo do Básico", "Vale-presente mensal", "Chat com lojistas", "Compras online com desconto"],
                destaque: true,
              },
              {
                nome: "VIP",
                preco: "Em breve",
                tag: "Pra quem aproveita tudo",
                bullets: ["Tudo do Premium", "Eventos exclusivos", "Early access", "Suporte prioritário"],
                destaque: false,
              },
            ].map((p) => (
              <article
                key={p.nome}
                className={`rounded-3xl border p-8 ${
                  p.destaque
                    ? "border-brava-yellow bg-brava-black text-white shadow-2xl"
                    : "border-brava-border bg-white text-brava-ink"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black">{p.nome}</h3>
                  {p.destaque && (
                    <span className="rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold text-brava-black">
                      {p.tag}
                    </span>
                  )}
                </div>
                <p className={`mt-6 text-3xl font-black ${p.destaque ? "text-brava-yellow" : "text-brava-blue"}`}>
                  {p.preco}
                </p>
                <ul className={`mt-6 space-y-3 text-sm ${p.destaque ? "text-white/85" : "text-brava-muted"}`}>
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className={`mt-0.5 ${p.destaque ? "text-brava-yellow" : "text-brava-blue"}`}>+</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ${
                    p.destaque
                      ? "bg-brava-yellow text-brava-black"
                      : "border border-brava-ink text-brava-ink hover:bg-brava-ink hover:text-white"
                  }`}
                >
                  Em breve
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-brava-border bg-brava-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 md:flex-row">
          <Image src="/logo.svg" alt="BRAVA+" width={140} height={50} />
          <p className="text-sm text-brava-muted">
            © {new Date().getFullYear()} BRAVA+ · Em construção
          </p>
        </div>
      </footer>
    </main>
  );
}
