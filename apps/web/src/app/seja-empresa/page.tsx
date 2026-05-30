import Link from "next/link";

export const metadata = {
  title: "BRAVA+ Empresas — benefício pra equipe inteira",
  description: "Ofereça BRAVA+ como benefício pros seus colaboradores. Pague por seat, eles ganham acesso ao clube de vantagens.",
};

export default function SejaEmpresaPage() {
  return (
    <main className="min-h-screen bg-brava-black text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight">
          BRAVA<span className="text-brava-yellow">+</span>
        </Link>
        <Link href="/entrar" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white">
          Entrar
        </Link>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-brava-yellow">BRAVA+ Empresas</p>
        <h1 className="mt-4 text-5xl font-black leading-tight sm:text-6xl">
          Benefício pra equipe.<br />
          <span className="text-brava-yellow">Sem rolar planilha.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
          Ofereça BRAVA+ pros seus colaboradores como benefício corporativo.
          Você paga por seat, eles ganham clube de vantagens em centenas de parceiros locais.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:empresas@bravamais.app?subject=Quero%20BRAVA%2B%20pra%20minha%20empresa"
            className="rounded-full bg-brava-yellow px-8 py-4 font-black text-brava-black hover:scale-105"
          >
            Quero conversar →
          </a>
          <Link
            href="/app"
            className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-bold text-white"
          >
            Conhecer o BRAVA+
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Por que dar BRAVA+?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            { emoji: "💸", title: "Retenção barata", body: "Custa menos que aumento de salário e tem percepção forte. Colaborador economiza R$ 150-300/mês usando o clube." },
            { emoji: "📊", title: "Adesão mensurável", body: "Você vê quantos seats foram ativados, quantas visitas geraram. Sem chute, dado real." },
            { emoji: "🤝", title: "Local matter", body: "Parceiros são da vizinhança, do bairro, da cidade — não um marketplace nacional. Empresa apoia o ecossistema local." },
          ].map((c) => (
            <article key={c.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="text-4xl">{c.emoji}</div>
              <h3 className="mt-3 text-xl font-black">{c.title}</h3>
              <p className="mt-2 text-sm text-white/70">{c.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-3xl font-black sm:text-4xl">Como funciona</h2>
        <ol className="mx-auto mt-10 max-w-2xl space-y-5 text-base">
          {[
            "Você fecha um contrato de N seats (mínimo 10). Cada seat custa R$ 19,90/mês (preço de referência — admin BRAVA+ ajusta no plano)",
            "Recebe link único pra distribuir entre colaboradores. Cada um se cadastra e o seat é consumido automaticamente",
            "Equipe ganha o trial top de 7 dias com tudo liberado. Depois, mantém todas categorias enquanto seat ativo",
            "Empresa recebe uma única nota mensal por todos os seats. Sem catraca, sem reembolso",
            "Painel de adoção: você vê quantos seats ativaram, quem usou no mês, % de retenção",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brava-yellow font-black text-brava-black">{i + 1}</span>
              <p className="pt-1.5 text-white/80">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border-2 border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-100/5 p-10 text-center">
          <h2 className="text-3xl font-black">Pronto pra começar?</h2>
          <p className="mt-2 text-white/75">
            Fale com a gente. Em 1 reunião a gente fecha o tamanho do contrato e ativa.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="mailto:empresas@bravamais.app?subject=BRAVA%2B%20Empresas"
              className="rounded-full bg-brava-yellow px-8 py-4 font-black text-brava-black hover:scale-105"
            >
              empresas@bravamais.app
            </a>
            <a
              href="https://wa.me/5511999999999?text=Oi,%20quero%20BRAVA%2B%20pra%20minha%20empresa"
              className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-bold text-white"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp comercial
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10 text-center text-xs text-white/50">
        © BRAVA+ · {new Date().getFullYear()} · <Link href="/" className="hover:underline">Voltar pra home</Link>
      </footer>
    </main>
  );
}
