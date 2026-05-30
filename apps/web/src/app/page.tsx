import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { type MapPin } from "@/components/establishments-map";
import { type LandingEstablishment } from "@/components/landing-establishments";
import { LandingExplorer } from "@/components/landing/landing-explorer";
import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { CategoryMarquee } from "@/components/landing/marquee";
import { Reveal } from "@/components/landing/reveal";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { EstablishmentSection } from "@/components/landing/establishment-section";
import { LandingStats } from "@/components/landing/stats";
import { LandingFAQ } from "@/components/landing/faq";

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
      cover: e.cover_url || e.photos?.[0] || null,
      categorySlugs:
        e.establishment_categories
          ?.map((ec) => ec.categories?.slug)
          .filter((s): s is string => Boolean(s)) ?? [],
    }));

  const categoriaList = (categorias ?? []).map((c) => c.name);

  return (
    <main className="relative flex-1 overflow-x-hidden">
      <LandingHeader />

      <LandingHero
        stats={{
          estabs: estabsCount ?? 0,
          cupons: cuponsAtivos ?? 0,
          categorias: categorias?.length ?? 0,
        }}
      />

      {/* MARQUEE de categorias */}
      <section className="border-y border-white/10 bg-brava-black py-8">
        <CategoryMarquee items={categoriaList.length ? categoriaList : ["Restaurantes", "Bares", "Cafés", "Moda", "Beleza"]} />
      </section>

      {/* STATS */}
      <LandingStats
        estabs={estabsCount ?? 0}
        cupons={cuponsAtivos ?? 0}
        cidades={new Set(all.map((e) => e.city).filter(Boolean)).size}
      />

      {/* EXPLORER: mapa + filtros + grid unificados */}
      <section id="parceiros" className="bg-brava-paper py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Explore</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-brava-ink md:text-7xl lg:text-8xl">
              {estabsCount ?? 0} parceiros{" "}
              <span className="bg-gradient-to-r from-brava-blue to-brava-blue-bright bg-clip-text text-transparent">
                perto de você
              </span>
              .
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-brava-muted md:text-xl">
              Mapa ao vivo do banco. Filtre por categoria, busque por nome ou ative sua localização pra ver o que tá pertinho.
            </p>
          </Reveal>

          <Reveal delay={0.3} className="mt-12">
            <LandingExplorer
              estabs={landingEstabs}
              pins={pins}
              categorias={categorias ?? []}
              initialMapHeight={560}
            />
          </Reveal>

          <Reveal delay={0.2} className="mt-16 text-center">
            <Link
              href="/assinar"
              className="group inline-flex items-center gap-3 rounded-full bg-brava-black px-8 py-5 text-base font-bold text-white shadow-xl transition-transform hover:scale-105"
            >
              Quero ver tudo
              <svg className="transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* VANTAGENS */}
      <section id="vantagens" className="bg-brava-black py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Pra você assinante</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl lg:text-8xl">
              9 jeitos de <span className="bg-gradient-to-r from-brava-yellow to-amber-300 bg-clip-text text-transparent">economizar</span> todo dia.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg text-white/70 md:text-xl">
              Não é um cupom solto. É um clube completo de vantagens que se acumulam toda vez que você sai de casa.
            </p>
          </Reveal>

          <div className="mt-16">
            <FeaturesGrid />
          </div>

          <Reveal delay={0.2} className="mt-16 flex flex-wrap items-center gap-4">
            <Link
              href="/assinar"
              className="group inline-flex items-center gap-3 rounded-full bg-brava-yellow px-8 py-5 text-base font-bold text-brava-black shadow-2xl shadow-brava-yellow/30 transition-transform hover:scale-105"
            >
              Começar 7 dias grátis
              <svg className="transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <p className="text-sm text-white/50">Cancela quando quiser. Sem fidelidade.</p>
          </Reveal>
        </div>
      </section>

      <EstablishmentSection />

      {/* PLANOS */}
      <section id="planos" className="bg-brava-paper py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Planos</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 text-5xl font-black leading-[0.95] tracking-tight text-brava-ink md:text-7xl lg:text-8xl">
              Escolha seu <span className="bg-gradient-to-r from-brava-blue to-brava-blue-bright bg-clip-text text-transparent">nível</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-brava-muted md:text-xl">
              7 dias grátis pra testar. Cancela quando quiser, sem fidelidade.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              {
                nome: "Básico", preco: "R$ 19,90", periodo: "/mês", tag: "Pra começar",
                bullets: ["Mapa completo de parceiros", "Cupons básicos", "Carteirinha QR", "Clube de fidelidade"], destaque: false, delay: 0,
              },
              {
                nome: "Premium", preco: "R$ 39,90", periodo: "/mês", tag: "Mais popular",
                bullets: ["Tudo do Básico", "Vale-presente mensal R$ 30", "Chat com lojistas", "Cupons exclusivos Premium", "Compra online com desconto extra"], destaque: true, delay: 0.1,
              },
              {
                nome: "VIP", preco: "R$ 79,90", periodo: "/mês", tag: "Pra quem aproveita tudo",
                bullets: ["Tudo do Premium", "Eventos exclusivos", "Early access a novas parcerias", "Cashback aumentado", "Suporte prioritário"], destaque: false, delay: 0.2,
              },
            ].map((p) => (
              <Reveal key={p.nome} delay={p.delay}>
                <article
                  className={`relative h-full rounded-3xl border p-8 transition-transform hover:-translate-y-2 hover:shadow-2xl ${
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Entregador */}
      <section className="border-t border-white/10 bg-brava-black py-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 lg:px-12">
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-brava-yellow">Entregadores</p>
              <h3 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">
                Faça parte da rede<br />de entregadores BRAVA+
              </h3>
              <p className="mt-5 max-w-md text-white/70">
                Cadastre-se grátis. Sua ficha fica disponível pros estabelecimentos parceiros entrarem em contato. Você
                negocia diretamente com cada loja — a BRAVA+ é apenas a ponte de conexão.
              </p>
              <Link
                href="/seja-entregador"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-brava-yellow px-7 py-4 text-sm font-bold text-brava-black hover:scale-[1.02]"
              >
                Quero ser entregador BRAVA+
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid h-full place-items-center rounded-3xl bg-gradient-to-br from-amber-500/10 to-brava-yellow/5 p-10 text-center text-7xl">
              🛵
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL DUAL */}
      <section className="bg-white py-32">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 lg:px-12">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue p-10 text-white md:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-yellow">Sou consumidor</p>
              <h3 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
                Comece a economizar hoje.
              </h3>
              <p className="mt-4 text-white/75">7 dias grátis. Sem fidelidade.</p>
              <Link
                href="/assinar"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-brava-yellow px-7 py-4 text-sm font-bold text-brava-black"
              >
                Assinar BRAVA+
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow to-amber-500 p-10 text-brava-black md:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Sou estabelecimento</p>
              <h3 className="mt-4 text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
                Coloque sua loja no mapa.
              </h3>
              <p className="mt-4 text-brava-black/75">Vitrine, fidelidade e dados num só lugar.</p>
              <Link
                href="/cadastro-estabelecimento"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-brava-black px-7 py-4 text-sm font-bold text-white"
              >
                Quero ser parceiro
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LandingFAQ />

      <SiteFooter />
    </main>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-brava-black text-white/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-12">
        <div>
          <Image src="/logo-dark.svg" alt="BRAVA+" width={140} height={50} />
          <p className="mt-5 max-w-sm text-sm">O clube de vantagens que conecta consumidor e estabelecimento — descontos, fidelidade e benefícios num só lugar.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Pra você</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/cadastro" className="hover:text-white">Criar conta</Link></li>
            <li><Link href="/entrar" className="hover:text-white">Entrar</Link></li>
            <li><Link href="/assinar" className="hover:text-white">Planos</Link></li>
            <li><a href="#vantagens" className="hover:text-white">Vantagens</a></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Estabelecimento</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/cadastro-estabelecimento" className="hover:text-white">Cadastrar loja</Link></li>
            <li><Link href="/seja-parceiro" className="hover:text-white">Como funciona</Link></li>
            <li><Link href="/seja-empresa" className="hover:text-white">BRAVA+ Empresas (B2B)</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">Legal</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/termos" className="hover:text-white">Termos</Link></li>
            <li><Link href="/privacidade" className="hover:text-white">Privacidade</Link></li>
            <li><a href="mailto:contato@bravamais.app" className="hover:text-white">Contato</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs">
        © {new Date().getFullYear()} BRAVA+ · Todos os direitos reservados
      </div>
    </footer>
  );
}
