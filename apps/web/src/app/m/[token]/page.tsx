import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MesaPublicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: mesa } = await supabase
    .from("mesa_qr")
    .select("*, establishment:establishment_id(id, name, slug, cover_url, tagline)")
    .eq("token", token)
    .maybeSingle();

  if (!mesa) notFound();

  // Bump counter
  await supabase.from("mesa_qr").update({
    scans: (mesa.scans ?? 0) + 1,
    last_scanned_at: new Date().toISOString(),
  }).eq("id", mesa.id);

  const { data: products } = await supabase
    .from("products")
    .select("id, name, description, price_cents, image_url")
    .eq("establishment_id", mesa.establishment.id)
    .eq("is_active", true)
    .order("name");

  return (
    <main className="min-h-screen bg-brava-paper">
      <header className="border-b border-brava-border bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">{mesa.label}</div>
          <h1 className="text-2xl font-black">{mesa.establishment.name}</h1>
          {mesa.establishment.tagline && <p className="text-sm text-brava-muted">{mesa.establishment.tagline}</p>}
        </div>
      </header>

      <section className="mx-auto max-w-2xl p-4">
        <h2 className="mb-3 text-xs font-bold uppercase text-brava-muted">Cardápio</h2>
        {products && products.length > 0 ? (
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id} className="flex gap-3 rounded-2xl border border-brava-border bg-white p-3">
                {p.image_url && <img src={p.image_url} alt="" className="size-20 rounded-lg object-cover" />}
                <div className="flex-1">
                  <div className="font-bold">{p.name}</div>
                  {p.description && <div className="text-xs text-brava-muted">{p.description}</div>}
                  <div className="mt-1 font-mono font-bold text-brava-blue">R$ {(p.price_cents / 100).toFixed(2)}</div>
                </div>
                <a href={`/checkout/${p.id}?mesa=${token}`} className="self-center rounded-lg bg-brava-blue px-3 py-1.5 text-xs font-bold text-white">
                  Pedir
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-white p-10 text-center text-sm text-brava-muted">
            Cardápio vazio. Peça pro garçom.
          </div>
        )}
      </section>

      <footer className="mx-auto max-w-2xl border-t border-brava-border bg-white p-4 text-center text-xs text-brava-muted">
        Pedido via BRAVA+ · pagamento PIX/cartão direto na conta da loja
      </footer>
    </main>
  );
}
