import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EstablishmentSignUpForm } from "./form";

export const metadata = { title: "Cadastrar estabelecimento" };

export default async function CadastroEstabelecimentoPage() {
  const supabase = await createClient();
  const { data: categorias } = await supabase
    .from("categories")
    .select("id, slug, name, display_order")
    .eq("is_active", true)
    .order("display_order");

  return (
    <main className="flex min-h-screen flex-col bg-brava-black text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        <div className="absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-brava-yellow blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[560px] w-[560px] rounded-full bg-brava-blue-bright blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="inline-flex">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={130} height={48} priority />
        </Link>
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Voltar</Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 gap-12 px-6 pb-20 lg:grid-cols-[1fr_1.1fr]">
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-yellow">Cadastro estabelecimento</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Sua loja no mapa em poucos minutos
          </h1>
          <p className="mt-4 text-white/75">
            Preencha os dados básicos pra entrar no clube. Depois você completa o perfil, sobe fotos, cria cupons e configura o clube de fidelidade.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              "Vitrine completa na busca e no mapa",
              "Cupons, vale-presente e clube de fidelidade",
              "Catálogo + checkout online (PIX + cartão)",
              "Chat direto com clientes BRAVA+",
              "Painel com dados de quem visita",
            ].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brava-yellow text-brava-blue">
                  <span className="text-sm font-black">+</span>
                </span>
                <span className="text-sm text-white/85">{b}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <h2 className="mb-6 text-2xl font-black lg:hidden">Cadastre seu estabelecimento</h2>
          <EstablishmentSignUpForm categorias={categorias ?? []} />
        </section>
      </div>
    </main>
  );
}
