import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Loja — Início" };

export default async function LojaHome() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [
    { count: productsCount },
    { count: couponsCount },
    { count: visitsCount },
    { count: ordersCount },
    { data: recentOrders },
    { data: visitsAgg },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id).eq("is_active", true),
    supabase.from("coupons").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id).eq("is_active", true),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("establishment_id", establishment.id),
    supabase
      .from("orders")
      .select("id, status, total_cents, created_at")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("visits")
      .select("id, created_at, source")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  type Order = { id: string; status: string; total_cents: number; created_at: string };
  type Visit = { id: string; created_at: string; source: string };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Painel da loja</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink md:text-4xl">{establishment.name}</h1>
          <p className="mt-1 text-brava-muted">
            {establishment.city ? `${establishment.city}/${establishment.state ?? ""}` : "—"}
            {establishment.is_active ? " · Ativa" : " · Pendente de ativação"}
          </p>
        </div>
        <Link
          href="/loja/qr-scanner"
          className="rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black shadow-md"
        >
          Abrir leitor de QR →
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Produtos ativos" value={`${productsCount ?? 0}`} />
        <Kpi label="Cupons ativos" value={`${couponsCount ?? 0}`} />
        <Kpi label="Visitas registradas" value={`${visitsCount ?? 0}`} />
        <Kpi label="Pedidos online" value={`${ordersCount ?? 0}`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Últimos pedidos</h2>
          {(recentOrders as Order[] | null)?.length ? (
            <ul className="mt-4 divide-y divide-brava-border">
              {(recentOrders as Order[]).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-mono text-xs text-brava-muted">{o.id.slice(0, 8)}</span>
                  <span className="rounded-full bg-brava-paper px-2 py-0.5 text-xs">{o.status}</span>
                  <span className="font-bold text-brava-ink">{formatBRL(o.total_cents)}</span>
                  <span className="text-xs text-brava-muted">{new Date(o.created_at).toLocaleDateString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-brava-muted">Nenhum pedido ainda.</p>
          )}
        </section>

        <section className="rounded-3xl border border-brava-border bg-white p-6">
          <h2 className="text-lg font-bold text-brava-ink">Últimas visitas</h2>
          {(visitsAgg as Visit[] | null)?.length ? (
            <ul className="mt-4 space-y-2">
              {(visitsAgg as Visit[]).map((v) => (
                <li key={v.id} className="flex items-center justify-between text-sm">
                  <span className="rounded-full bg-brava-yellow/30 px-2 py-0.5 text-xs text-brava-blue">{v.source}</span>
                  <span className="text-xs text-brava-muted">
                    {new Date(v.created_at).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-brava-muted">Ainda sem visitas. Comece lendo o QR de um cliente.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-white p-5">
      <p className="text-xs uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-brava-ink">{value}</p>
    </article>
  );
}
