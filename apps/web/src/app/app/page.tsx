import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import type { Category } from "@/lib/supabase/types";

export const metadata = { title: "Início" };

export default async function AppHomePage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: categorias } = await supabase
    .from("categories")
    .select("id, slug, name, icon, display_order, is_active, created_at")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
      <section className="rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue p-8 text-white">
        <p className="text-sm uppercase tracking-wider text-brava-yellow">Bem-vindo</p>
        <h1 className="mt-2 text-4xl font-black md:text-5xl">
          Oi, {primeiroNome(profile.full_name)} 👋
        </h1>
        <p className="mt-3 max-w-xl text-white/80">
          Aproveite as vantagens do clube. Encontre estabelecimentos parceiros perto de você e mostre sua carteirinha pra acumular benefícios.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/app/buscar"
            className="inline-flex rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black"
          >
            Buscar estabelecimentos
          </Link>
          <Link
            href="/app/carteirinha"
            className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            Minha carteirinha QR
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black text-brava-ink">Explore por categoria</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(categorias ?? []).map((c: Category) => (
            <Link
              key={c.id}
              href={`/app/buscar?categoria=${c.slug}`}
              className="group rounded-2xl border border-brava-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-yellow text-xl">
                <span className="font-black text-brava-blue">+</span>
              </div>
              <p className="mt-3 text-sm font-bold text-brava-ink">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center">
        <p className="text-brava-muted">
          Sem estabelecimentos cadastrados ainda. Em breve você vê aqui os parceiros próximos a você.
        </p>
      </section>
    </div>
  );
}

function primeiroNome(nome: string | null): string {
  if (!nome) return "amigo";
  return nome.split(" ")[0];
}
