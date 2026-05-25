import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Listas editoriais" };

interface EditorialList {
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  city: string | null;
}

export default async function ListasPage() {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: listsRaw } = await supabase
    .from("editorial_lists")
    .select("slug, title, description, cover_url, city")
    .eq("is_published", true)
    .order("display_order");
  const lists = (listsRaw as EditorialList[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Curadoria BRAVA+</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">Listas editoriais</h1>
        <p className="mt-2 text-sm text-brava-muted">
          Coleções selecionadas a dedo pela nossa curadoria — os melhores lugares por tema, ocasião e cidade.
        </p>
      </header>

      {lists.length === 0 ? (
        <div className="rounded-3xl border border-brava-border bg-brava-card p-10 text-center">
          <p className="text-4xl">📑</p>
          <p className="mt-3 font-bold text-brava-ink">Nenhuma lista publicada ainda</p>
          <p className="mt-1 text-sm text-brava-muted">
            Em breve nossa curadoria solta novas coleções por aqui. Fique de olho!
          </p>
          <Link
            href="/app/buscar"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brava-yellow px-4 py-2 text-sm font-bold text-brava-black transition hover:brightness-105"
          >
            🔎 Explorar parceiros
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((l) => (
            <Link
              key={l.slug}
              href={`/app/listas/${l.slug}`}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright p-5 text-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              {l.cover_url && (
                <Image
                  src={l.cover_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="absolute inset-0 object-cover opacity-30 transition group-hover:opacity-40"
                />
              )}
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brava-yellow">
                  {l.city ?? "Lista"}
                </p>
                <p className="mt-2 text-lg font-black leading-tight">{l.title}</p>
                {l.description && <p className="mt-1 text-xs text-white/70">{l.description}</p>}
                <p className="mt-3 text-xs font-bold text-brava-yellow transition group-hover:translate-x-1">
                  Ver lista →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
