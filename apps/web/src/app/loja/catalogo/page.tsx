import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { ProductForm } from "./form";
import { deleteProductAction, toggleProductAction } from "./actions";

export const metadata = { title: "Catálogo" };

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  photos: string[];
  is_active: boolean;
}

export default async function CatalogoPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_cents, photos, is_active")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Catálogo</h1>
      <p className="mt-1 text-brava-muted">Adicione produtos pra venda online e exibição na sua vitrine.</p>

      <section className="mt-8 rounded-3xl border border-brava-border bg-white p-6">
        <h2 className="text-lg font-bold text-brava-ink">Novo produto</h2>
        <div className="mt-4">
          <ProductForm />
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-bold text-brava-ink">Produtos ({products?.length ?? 0})</h2>
        {(products as Product[] | null)?.length ? (
          (products as Product[]).map((p) => (
            <article
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-brava-border bg-white p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brava-paper">
                {p.photos[0] && (
                  <Image src={p.photos[0]} alt={p.name} fill sizes="64px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brava-ink">{p.name}</p>
                {p.description && <p className="text-sm text-brava-muted line-clamp-1">{p.description}</p>}
              </div>
              <p className="text-lg font-black text-brava-blue">{formatBRL(p.price_cents)}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
              >
                {p.is_active ? "ativo" : "pausado"}
              </span>
              <form action={toggleProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="is_active" value={String(p.is_active)} />
                <button className="text-sm text-brava-blue hover:underline">{p.is_active ? "pausar" : "ativar"}</button>
              </form>
              <form action={deleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-sm text-red-600 hover:underline">excluir</button>
              </form>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-brava-muted">
            Nenhum produto cadastrado.
          </p>
        )}
      </section>
    </div>
  );
}
