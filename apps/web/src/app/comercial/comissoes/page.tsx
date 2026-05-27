import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";

function brl(cents: number | null | undefined) {
  return `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function ComercialComissoesPage() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  // Estabs cadastrados
  const { data: estabs } = await supabase
    .from("affiliate_referrals")
    .select("id, signed_at, commission_until, commission_rate, total_paid_cents, establishment:establishment_id(name, slug, city)")
    .eq("affiliate_id", affiliate.id)
    .order("signed_at", { ascending: false });

  // Assinantes
  const { data: subs } = await supabase
    .from("subscriber_referrals")
    .select("id, signed_at, commission_until, total_paid_cents, profile:user_id(full_name, email), sub:user_id(subscriptions(tier, status))")
    .eq("affiliate_id", affiliate.id)
    .order("signed_at", { ascending: false });

  // Histórico de payouts pagos
  const { data: payouts } = await supabase
    .from("affiliate_payouts")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("period_month", { ascending: false });

  // Projeção do mês via RPC
  const { data: kpis } = await supabase.rpc("commercial_dashboard", { p_affiliate_id: affiliate.id });
  const k = kpis?.[0] ?? null;

  const totalEstabPago = (estabs ?? []).reduce((s, e) => s + (e.total_paid_cents ?? 0), 0);
  const totalSubPago = (subs ?? []).reduce((s, x) => s + (x.total_paid_cents ?? 0), 0);
  const totalPayouts = (payouts ?? []).reduce((s, p) => s + (p.amount_cents ?? 0), 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">financeiro</div>
        <h1 className="text-2xl font-black tracking-tight">Minhas comissões</h1>
        <p className="text-sm text-brava-muted">
          Tudo que você já ganhou, o que está em pipeline e o que vai cair esse mês (estimado).
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total já pago" value={brl(totalPayouts)} />
        <Kpi label="Comissão mês (estab)" value={brl(k?.commission_estab_month_cents)} tone="yellow" />
        <Kpi label="Comissão mês (sub)" value={brl(k?.commission_sub_month_cents)} tone="blue" />
        <Kpi label="Total mês estimado" value={brl((k?.commission_estab_month_cents ?? 0) + (k?.commission_sub_month_cents ?? 0))} tone="green" />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">
          Histórico de pagamentos ({payouts?.length ?? 0})
        </h2>
        {payouts && payouts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-brava-border">
            <table className="w-full text-sm table-cards">
              <thead className="bg-brava-paper text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Período</th>
                  <th className="px-4 py-2 text-left">Estabs</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                  <th className="px-4 py-2 text-left">Pago em</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: any) => (
                  <tr key={p.id} className="border-t border-brava-border bg-brava-card">
                    <td className="px-4 py-2">{new Date(p.period_month).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-2">{p.estabs_count}</td>
                    <td className="px-4 py-2 text-right font-bold">{brl(p.amount_cents)}</td>
                    <td className="px-4 py-2">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("pt-BR") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Nenhum pagamento ainda. Eles entram aqui quando o admin processar o payout mensal." />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">
          Estabelecimentos que pagam comissão ({estabs?.length ?? 0})
        </h2>
        {estabs && estabs.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-brava-border">
            <table className="w-full text-sm table-cards">
              <thead className="bg-brava-paper text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Loja</th>
                  <th className="px-4 py-2 text-left">Cidade</th>
                  <th className="px-4 py-2 text-left">Cadastro</th>
                  <th className="px-4 py-2 text-left">Comissão até</th>
                  <th className="px-4 py-2 text-right">Total pago</th>
                </tr>
              </thead>
              <tbody>
                {estabs.map((e: any) => (
                  <tr key={e.id} className="border-t border-brava-border bg-brava-card">
                    <td className="px-4 py-2 font-bold">{e.establishment?.name ?? "—"}</td>
                    <td className="px-4 py-2 text-brava-muted">{e.establishment?.city ?? "—"}</td>
                    <td className="px-4 py-2 text-xs">{new Date(e.signed_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-xs">{new Date(e.commission_until).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-right">{brl(e.total_paid_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Nenhum estabelecimento vinculado ainda. Cadastre um pelo mapa ou link de convite." />
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">
          Assinantes que pagam comissão ({subs?.length ?? 0})
        </h2>
        {subs && subs.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-brava-border">
            <table className="w-full text-sm table-cards">
              <thead className="bg-brava-paper text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Nome</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Cadastro</th>
                  <th className="px-4 py-2 text-left">Comissão até</th>
                  <th className="px-4 py-2 text-right">Total pago</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s: any) => (
                  <tr key={s.id} className="border-t border-brava-border bg-brava-card">
                    <td className="px-4 py-2 font-bold">{s.profile?.full_name ?? "—"}</td>
                    <td className="px-4 py-2 text-brava-muted">{s.profile?.email ?? "—"}</td>
                    <td className="px-4 py-2 text-xs">{new Date(s.signed_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-xs">{new Date(s.commission_until).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-2 text-right">{brl(s.total_paid_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Nenhum assinante vinculado ainda." />
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "yellow" | "blue" | "green" }) {
  const cls = tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue" ? "border-brava-blue/30 bg-brava-blue/5"
    : tone === "green" ? "border-green-300 bg-green-50"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${cls} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black sm:text-2xl">{value}</div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>
  );
}
