import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EstablishmentsMap, type MapPin } from "@/components/establishments-map";
import { LandingEstablishments, type LandingEstablishment } from "@/components/landing-establishments";

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: estabsRaw, count: estabsCount },
    { data: categorias },
    { count: cuponsAtivos },
  ] = await Promise.all([
    supabase
      .from("establishments")
      .select(
        `slug, name, tagline, city, state, lat, lng, logo_url, cover_url, photos,
         establishment_categories(categories(slug, name)),
         establishment_promotions(promotion_type, is_active)`,
        { count: "exact" },
      )
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("categories")
      .select("slug, name, display_order")
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  type RawEstab = {
    slug: string;
    name: string;
    tagline: string | null;
    city: string | null;
    state: string | null;
    lat: number | null;
    lng: number | null;
    logo_url: string | null;
    cover_url: string | null;
    photos: string[] | null;
    establishment_categories?: { categories: { slug: string; name: string } | null }[];
    establishment_promotions?: { promotion_type: string; is_active: boolean }[];
  };

  const all = (estabsRaw as unknown as RawEstab[]) ?? [];

  const landingEstabs: LandingEstablishment[] = all.map((e) => ({
    slug: e.slug,
    name: e.name,
    tagline: e.tagline,
    city: e.city,
    state: e.state,
    logo_url: e.logo_url,
    cover_url: e.cover_url,
    photos: e.photos ?? [],
    categorySlugs:
      e.establishment_categories
        ?.map((ec) => ec.categories?.slug)
        .filter((s): s is string => Boolean(s)) ?? [],
    promos:
      e.establishment_promotions
        ?.filter((p) => p.is_active)
        .map((p) => p.promotion_type) ?? [],
  }));

  const pins: MapPin[] = all
    .filter((e) => typeof e.lat === "number" && typeof e.lng === "number")
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      lat: e.lat!,
      lng: e.lng!,
      city: e.city,
      state: e.state,
    }));

  return (
    <main className="flex-1">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-brava-black text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-brava-yellow blur-3xl" />
          <div className="absolute -bottom-40 -left-32 h-[560px] w-[560px] rounded-full bg-brava-blue-bright blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-[1.1fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brava-yellow">
                Clube de vantagens
              </span>
              <h1 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Mais economia,{" "}
                <span className="text-brava-yellow">mais vantagem</span>,{" "}
                <span className="text-brava-yellow">mais BRAVA+</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/80 md:text-xl">
                {estabsCount ?? 0} estabelecimentos parceiros, {cuponsAtivos ?? 0}+ cupons ativos e benefícios reais nos lugares que você frequenta.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/assinar"
                  className="inline-flex items-center rounded-full bg-brava-yellow px-7 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.02]"
                >
                  Quero assinar
                </Link>
                <Link
                  href="/seja-parceiro"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
                >
                  Sou estabelecimento
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <Stat n={`${estabsCount ?? 0}`} label="parceiros" />
                <Stat n={`${cuponsAtivos ?? 0}+`} label="cupons" />
                <Stat n="5" label="tipos de promo" />
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute h-96 w-96 rounded-full bg-gradient-to-br from-brava-yellow/40 via-transparent to-brava-blue/40 blur-3xl" />
              <Image src="/logo-mark.svg" alt="" width={460} height={460} priority className="relative drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section id="mapa" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Onde estamos</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
                {estabsCount ?? 0} parceiros no mapa
              </h2>
              <p className="mt-2 max-w-xl text-brava-muted">
                Clique nos pinos pra conhecer cada lugar. Quanto mais perto de você, mais fácil de aproveitar.
              </p>
            </div>
          </div>
          <EstablishmentsMap pins={pins} height={520} />
        </div>
      </section>

      {/* GRID + FILTROS */}
      <section id="estabelecimentos" className="bg-brava-paper py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Explore</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            Encontre o seu próximo achado
          </h2>
          <p className="mt-3 max-w-xl text-brava-muted">
            Filtre por categoria, tipo de promoção ou busque pelo nome.
          </p>

          <div className="mt-10">
            <LandingEstablishments estabs={landingEstabs} categorias={categorias ?? []} limit={16} />
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/assinar"
              className="inline-flex items-center rounded-full bg-brava-black px-7 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Crie conta pra ver todos os parceiros e cupons
            </Link>
          </div>
        </div>
      </section>

      {/* TIPOS DE PROMOÇÃO */}
      <section id="promocoes" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Como você ganha</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            5 jeitos de aproveitar a BRAVA+
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { titulo: "Cupom de desconto", texto: "Códigos exclusivos aplicados direto no checkout." },
              { titulo: "Vale-presente", texto: "Créditos que viram presente em datas especiais." },
              { titulo: "Vale-compras", texto: "Saldo acumulado pra trocar por produtos." },
              { titulo: "Clube de fidelidade", texto: "Cada visita ou compra conta. Atingiu o objetivo? Prêmio." },
              { titulo: "Cashback", texto: "Parte do que você gasta volta em saldo BRAVA+." },
            ].map((p) => (
              <article key={p.titulo} className="rounded-3xl border border-brava-border bg-brava-paper p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brava-yellow text-brava-blue">
                  <span className="text-2xl font-black">+</span>
                </div>
                <h3 className="text-base font-bold text-brava-ink">{p.titulo}</h3>
                <p className="mt-2 text-sm text-brava-muted">{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRA VOCÊ ASSINANTE */}
      <section className="bg-brava-paper py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Pra você assinante</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
                Vantagens reais, todo dia
              </h2>
              <p className="mt-4 max-w-md text-brava-muted">
                Assina, escolhe os lugares que você curte e começa a economizar. Sem letras miúdas.
              </p>
              <Link
                href="/assinar"
                className="mt-8 inline-flex items-center rounded-full bg-brava-yellow px-6 py-3.5 text-base font-bold text-brava-black shadow-lg"
              >
                Começar agora
              </Link>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                { t: "Carteirinha digital com QR", d: "Mostra no balcão, marca visita, acumula no clube de fidelidade." },
                { t: "Mapa de parceiros perto", d: "Encontre estabelecimentos perto de onde você está." },
                { t: "Compra online com desconto", d: "Pague no cartão ou PIX com cupom aplicado direto." },
                { t: "Chat com os lojistas", d: "Tira dúvida sem ter que pegar o telefone." },
                { t: "Vale-presente todo mês", d: "Premium e VIP ganham créditos pra usar onde quiser." },
                { t: "Eventos exclusivos", d: "VIPs entram em pré-vendas e experiências fechadas." },
              ].map((b) => (
                <li key={b.t} className="rounded-2xl border border-brava-border bg-white p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brava-yellow/30 text-brava-blue">
                    <span className="font-black">+</span>
                  </div>
                  <p className="font-bold text-brava-ink">{b.t}</p>
                  <p className="mt-1 text-sm text-brava-muted">{b.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRA VOCÊ LOJISTA */}
      <section className="relative overflow-hidden bg-brava-black py-20 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-brava-yellow blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brava-yellow">Pra você estabelecimento</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                Atraia clientes fiéis, sem campanha cara
              </h2>
              <p className="mt-4 max-w-xl text-white/75">
                BRAVA+ traz o cliente certo até você. Você ganha vitrine, dados de comportamento e ferramentas pra fidelizar
                quem já vem e atrair quem está perto.
              </p>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { t: "Sua loja no mapa", d: "Apareça pra quem busca por categoria, promoção ou proximidade." },
                  { t: "Cupons configuráveis", d: "Crie cupons sazonais ou exclusivos pra assinantes." },
                  { t: "Clube de fidelidade próprio", d: "Defina a regra: X visitas = qual prêmio." },
                  { t: "Vale-presente e vale-compras", d: "Use como ferramenta de retenção e datas comemorativas." },
                  { t: "Catálogo + compra online", d: "Receba pedidos com PIX ou cartão sem investir em e-commerce." },
                  { t: "Chat direto com o cliente", d: "Tira dúvida, faz reserva, vende." },
                  { t: "Validação por QR na entrada", d: "Lê o QR da carteirinha pra marcar visita." },
                  { t: "Painel com dados de quem visita", d: "Veja seus melhores clientes, top dias, top produtos." },
                ].map((b) => (
                  <li key={b.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brava-yellow text-brava-blue">
                      <span className="font-black">+</span>
                    </div>
                    <p className="font-bold">{b.t}</p>
                    <p className="mt-1 text-sm text-white/70">{b.d}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/cadastro-estabelecimento"
                  className="inline-flex items-center rounded-full bg-brava-yellow px-7 py-4 text-base font-bold text-brava-black shadow-xl shadow-brava-yellow/30 transition-transform hover:scale-[1.02]"
                >
                  Cadastrar minha loja
                </Link>
                <Link
                  href="/seja-parceiro"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur hover:bg-white/10"
                >
                  Saber mais
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brava-yellow/30 to-brava-blue/20 blur-3xl" />
              <div className="relative rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
                <p className="text-sm uppercase tracking-wider text-brava-yellow">Resultado parceiro</p>
                <p className="mt-4 text-4xl font-black">+34%</p>
                <p className="mt-1 text-white/70">aumento em recorrência mensal de clientes que viraram BRAVA+</p>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm">
                  <div>
                    <p className="text-white/60">Cupons ativos</p>
                    <p className="text-2xl font-black">{cuponsAtivos ?? 0}+</p>
                  </div>
                  <div>
                    <p className="text-white/60">Categorias</p>
                    <p className="text-2xl font-black">{categorias?.length ?? 0}+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-bold uppercase tracking-wider text-brava-blue">Planos</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-brava-ink md:text-5xl">
            Escolha seu nível
          </h2>
          <p className="mt-3 max-w-2xl text-brava-muted">
            7 dias grátis pra testar. Cancela quando quiser, sem fidelidade.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                nome: "Básico", preco: "R$ 19,90", periodo: "/mês", tag: "Pra começar",
                bullets: ["Mapa completo de parceiros", "Cupons básicos", "Carteirinha QR", "Clube de fidelidade"], destaque: false,
              },
              {
                nome: "Premium", preco: "R$ 39,90", periodo: "/mês", tag: "Mais popular",
                bullets: ["Tudo do Básico", "Vale-presente mensal R$ 30", "Chat com lojistas", "Cupons exclusivos Premium", "Compra online com desconto extra"], destaque: true,
              },
              {
                nome: "VIP", preco: "R$ 79,90", periodo: "/mês", tag: "Pra quem aproveita tudo",
                bullets: ["Tudo do Premium", "Eventos exclusivos", "Early access a novas parcerias", "Cashback aumentado", "Suporte prioritário"], destaque: false,
              },
            ].map((p) => (
              <article
                key={p.nome}
                className={`relative rounded-3xl border p-8 ${
                  p.destaque ? "border-brava-yellow bg-brava-black text-white shadow-2xl" : "border-brava-border bg-white text-brava-ink"
                }`}
              >
                {p.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold text-brava-black">
                    {p.tag}
                  </span>
                )}
                <h3 className="text-2xl font-black">{p.nome}</h3>
                <p className={`mt-4 text-4xl font-black ${p.destaque ? "text-brava-yellow" : "text-brava-blue"}`}>
                  {p.preco}
                  <span className={`text-base font-medium ${p.destaque ? "text-white/60" : "text-brava-muted"}`}>{p.periodo}</span>
                </p>
                <ul className={`mt-6 space-y-3 text-sm ${p.destaque ? "text-white/85" : "text-brava-muted"}`}>
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className={`mt-0.5 ${p.destaque ? "text-brava-yellow" : "text-brava-blue"}`}>+</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/assinar"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ${
                    p.destaque ? "bg-brava-yellow text-brava-black" : "border border-brava-ink text-brava-ink hover:bg-brava-ink hover:text-white"
                  }`}
                >
                  Quero esse plano
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL DUPLA */}
      <section className="bg-brava-paper py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue p-10 text-white">
            <p className="text-sm uppercase tracking-wider text-brava-yellow">Sou consumidor</p>
            <h3 className="mt-3 text-3xl font-black">Comece a economizar hoje</h3>
            <p className="mt-3 text-white/75">7 dias grátis. Sem fidelidade.</p>
            <Link
              href="/assinar"
              className="mt-6 inline-flex items-center rounded-full bg-brava-yellow px-6 py-3.5 text-sm font-bold text-brava-black"
            >
              Assinar BRAVA+
            </Link>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-brava-yellow to-brava-yellow-deep p-10 text-brava-black">
            <p className="text-sm uppercase tracking-wider text-brava-blue">Sou estabelecimento</p>
            <h3 className="mt-3 text-3xl font-black">Coloque sua loja no mapa</h3>
            <p className="mt-3 text-brava-black/75">Vitrine, fidelidade e dados — tudo num lugar só.</p>
            <Link
              href="/seja-parceiro"
              className="mt-6 inline-flex items-center rounded-full bg-brava-black px-6 py-3.5 text-sm font-bold text-white"
            >
              Quero ser parceiro
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black text-brava-yellow">{n}</p>
      <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-brava-border bg-brava-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="inline-flex">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} priority />
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-white/80 md:flex">
          <a href="#estabelecimentos" className="hover:text-white">Parceiros</a>
          <a href="#promocoes" className="hover:text-white">Promoções</a>
          <a href="#planos" className="hover:text-white">Planos</a>
          <Link href="/seja-parceiro" className="hover:text-white">Sou estabelecimento</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/entrar" className="hidden rounded-full px-4 py-2 text-sm text-white/90 hover:text-white sm:inline-flex">
            Entrar
          </Link>
          <Link href="/assinar" className="inline-flex items-center rounded-full bg-brava-yellow px-4 py-2 text-sm font-bold text-brava-black">
            Assinar
          </Link>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-brava-border bg-brava-black text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Image src="/logo-dark.svg" alt="BRAVA+" width={130} height={48} />
          <p className="mt-4 text-sm">O clube de vantagens que conecta consumidor e estabelecimento.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white">Pra você</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/assinar" className="hover:text-white">Criar conta</Link></li>
            <li><Link href="/entrar" className="hover:text-white">Entrar</Link></li>
            <li><a href="#planos" className="hover:text-white">Planos</a></li>
            <li><a href="#promocoes" className="hover:text-white">Tipos de promoção</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white">Estabelecimento</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/seja-parceiro" className="hover:text-white">Seja parceiro</Link></li>
            <li><a href="https://wa.me/5511999998888" target="_blank" rel="noopener noreferrer" className="hover:text-white">Fale com a equipe</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Termos</a></li>
            <li><a href="#" className="hover:text-white">Privacidade</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} BRAVA+ · Todos os direitos reservados
      </div>
    </footer>
  );
}
