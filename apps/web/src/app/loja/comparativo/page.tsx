import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function ComparativoPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  // Receita/pedidos da minha loja (últimos 30 dias)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [{ data: meusOrders }, { data: minhaCategoria }] = await Promise.all([
    supabase.from("orders").select("total_cents").eq("establishment_id", establishment.id).in("status", ["paid", "completed"]).gte("created_at", since.toISOString()),
    supabase.from("establishment_categories").select("category_id").eq("establishment_id", establishment.id).maybeSingle(),
  ]);

  const minhaReceita = (meusOrders ?? []).reduce((s, o) => s + (o.total_cents ?? 0), 0);
  const meusPedidos = (meusOrders ?? []).length;

  // Benchmark regional
  let benchmark: any = null;
  if (minhaCategoria?.category_id && establishment.city) {
    const { data } = await supabase
      .from("estab_regional_benchmarks")
      .select("*")
      .eq("category_id", minhaCategoria.category_id)
      .eq("city", establishment.city)
      .maybeSingle();
    benchmark = data;
  }

  const compareReceita = benchmark && benchmark.avg_revenue_cents > 0
    ? Math.round(((minhaReceita - benchmark.avg_revenue_cents) / benchmark.avg_revenue_cents) * 100)
    : null;
  const comparePedidos = benchmark && benchmark.avg_orders_per_estab > 0
    ? Math.round(((meusPedidos - benchmark.avg_orders_per_estab) / benchmark.avg_orders_per_estab) * 100)
    : null;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">benchmark regional</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Comparativo anônimo</h1>
        <p className="text-sm text-brava-muted">Como sua loja está vs média de outras lojas da mesma categoria + cidade. Dados sempre agregados (nunca expomos quem é quem).</p>
      </header>

      {benchmark ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2">
            <Comparison label="Receita 30 dias" mine={brl(minhaReceita)} avg={brl(benchmark.avg_revenue_cents)} diff={compareReceita} />
            <Comparison label="Pedidos 30 dias" mine={String(meusPedidos)} avg={String(Math.round(benchmark.avg_orders_per_estab))} diff={comparePedidos} />
          </section>

          <section className="rounded-2xl border border-brava-blue/30 bg-brava-blue/5 p-4">
            <h2 className="mb-2 text-xs font-bold uppercase text-brava-blue">Sugestões pra você melhorar</h2>
            <ul className="space-y-1 text-sm">
              {compareReceita !== null && compareReceita < -20 && (
                <li>📉 Sua receita está {Math.abs(compareReceita)}% abaixo da média. Considere blast semanal + cupom mais agressivo (20-30%).</li>
              )}
              {comparePedidos !== null && comparePedidos < -20 && (
                <li>📦 Menos pedidos que a média. Estimule retirada via QR (Mesa QR), reduza atrito do checkout.</li>
              )}
              {compareReceita !== null && compareReceita > 20 && (
                <li>🚀 Você está acima da média. Considere subir pra plano Premium pra capturar mais valor.</li>
              )}
              {benchmark.avg_coupons > 0 && (
                <li>🎟️ Média da região: {Math.round(benchmark.avg_coupons)} cupons/mês resgatados. Verifique se você está criando o suficiente.</li>
              )}
            </ul>
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Sem dados de benchmark ainda — sua categoria + cidade precisa de mais lojas pra agregação anônima.
        </div>
      )}
    </div>
  );
}

function Comparison({ label, mine, avg, diff }: { label: string; mine: string; avg: string; diff: number | null }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-2xl font-black">{mine}</div>
      <div className="mt-1 text-xs text-brava-muted">Média da região: {avg}</div>
      {diff !== null && (
        <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${diff >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {diff >= 0 ? "+" : ""}{diff}% vs média
        </div>
      )}
    </div>
  );
}
