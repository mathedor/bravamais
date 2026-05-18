import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";

function brl(cents: number | null | undefined) {
  return `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function ComercialDashboard() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const { data: kpis } = await supabase.rpc("commercial_dashboard", { p_affiliate_id: affiliate.id });
  const k = kpis?.[0] ?? null;

  const { data: next } = await supabase
    .from("commercial_prospects")
    .select("id, name, status, next_action_at, next_action_label")
    .eq("affiliate_id", affiliate.id)
    .not("next_action_at", "is", null)
    .order("next_action_at", { ascending: true })
    .limit(5);

  const { data: lastEstabs } = await supabase
    .from("affiliate_referrals")
    .select("id, signed_at, establishment:establishment_id(name, slug, city)")
    .eq("affiliate_id", affiliate.id)
    .order("signed_at", { ascending: false })
    .limit(5);

  const { data: lastSubs } = await supabase
    .from("subscriber_referrals")
    .select("id, signed_at, profile:user_id(full_name, email)")
    .eq("affiliate_id", affiliate.id)
    .order("signed_at", { ascending: false })
    .limit(5);

  const fechado = k?.prospects_fechado ?? 0;
  const total = k?.prospects_total ?? 0;
  const conv = total > 0 ? ((fechado / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">painel comercial</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Olá, {affiliate.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-brava-muted">
          Seu código: <span className="font-mono font-bold text-brava-ink">{affiliate.code}</span>
          {affiliate.territory && <> · Território: <b>{affiliate.territory}</b></>}
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão estimada do mês</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Estabs cadastrados (mês)" value={String(k?.estabs_no_mes ?? 0)} hint={`${k?.estabs_ativos ?? 0} ativos hist.`} tone="yellow" />
          <KpiCard label="Assinantes (mês)" value={String(k?.subs_no_mes ?? 0)} hint={`${k?.subs_ativos ?? 0} ativos hist.`} tone="blue" />
          <KpiCard label="Comissão estabs (mês)" value={brl(k?.commission_estab_month_cents)} hint="estimado, baseado em receita atual" />
          <KpiCard label="Comissão assinantes (mês)" value={brl(k?.commission_sub_month_cents)} hint="estimado pelas mensalidades ativas" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">
          Pipeline · conversão {conv}% ({fechado} fechados de {total})
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
          <PipelinePill label="Novo" count={k?.prospects_novo ?? 0} />
          <PipelinePill label="Contato" count={k?.prospects_contato ?? 0} />
          <PipelinePill label="Visita" count={k?.prospects_visita ?? 0} />
          <PipelinePill label="Proposta" count={k?.prospects_proposta ?? 0} />
          <PipelinePill label="Negociação" count={k?.prospects_negociacao ?? 0} />
          <PipelinePill label="Fechado" count={k?.prospects_fechado ?? 0} tone="green" />
          <PipelinePill label="Perdido" count={k?.prospects_perdido ?? 0} tone="red" />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brava-muted">Próximas ações</h2>
          <Link href="/comercial/crm" className="text-xs font-bold text-brava-blue hover:underline">
            ver tudo →
          </Link>
        </div>
        {next && next.length > 0 ? (
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {next.map((n) => (
              <li key={n.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-bold text-brava-ink">{n.name}</div>
                  <div className="text-xs text-brava-muted">{n.next_action_label ?? "Sem ação definida"}</div>
                </div>
                <div className="text-xs text-brava-blue">
                  {n.next_action_at ? new Date(n.next_action_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyCard text="Sem tarefas agendadas. Cadastre um prospect no CRM com data de próxima ação." />
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Últimos estabs fechados</h2>
          {lastEstabs && lastEstabs.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
              {lastEstabs.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <div className="font-bold text-brava-ink">{r.establishment?.name ?? "—"}</div>
                    <div className="text-xs text-brava-muted">{r.establishment?.city ?? "—"}</div>
                  </div>
                  <div className="text-xs text-brava-muted">{new Date(r.signed_at).toLocaleDateString("pt-BR")}</div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard text="Nenhum estabelecimento fechado ainda." />
          )}
        </div>
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Últimos assinantes fechados</h2>
          {lastSubs && lastSubs.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
              {lastSubs.map((r: any) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <div className="font-bold text-brava-ink">{r.profile?.full_name ?? "—"}</div>
                    <div className="text-xs text-brava-muted">{r.profile?.email ?? "—"}</div>
                  </div>
                  <div className="text-xs text-brava-muted">{new Date(r.signed_at).toLocaleDateString("pt-BR")}</div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard text="Nenhum assinante fechado ainda." />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">
          Sua tabela de comissão (configurada pelo admin)
        </h2>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-brava-paper p-3">
            <div className="text-xs font-bold uppercase text-brava-blue">Estabelecimentos</div>
            <div className="mt-1">
              {affiliate.establishment_commission_kind === "percent" ? (
                <>📊 <b>{(affiliate.establishment_commission_value * 100).toFixed(1)}%</b> sobre receita por <b>{affiliate.establishment_commission_months} meses</b></>
              ) : (
                <>💵 <b>R$ {affiliate.establishment_commission_value.toFixed(2)}</b> fixo por estab cadastrado</>
              )}
            </div>
          </div>
          <div className="rounded-lg bg-brava-paper p-3">
            <div className="text-xs font-bold uppercase text-brava-blue">Assinantes (por tier)</div>
            <div className="mt-1 space-y-0.5 text-xs">
              {affiliate.subscriber_commission_kind === "percent" ? (
                <>
                  <div>Básico: <b>{(affiliate.subscriber_commission_basic_value * 100).toFixed(1)}%</b></div>
                  <div>Premium: <b>{(affiliate.subscriber_commission_premium_value * 100).toFixed(1)}%</b></div>
                  <div>VIP: <b>{(affiliate.subscriber_commission_vip_value * 100).toFixed(1)}%</b></div>
                  <div className="text-brava-muted">por {affiliate.subscriber_commission_months} meses</div>
                </>
              ) : (
                <>
                  <div>Básico: <b>R$ {affiliate.subscriber_commission_basic_value.toFixed(2)}</b></div>
                  <div>Premium: <b>R$ {affiliate.subscriber_commission_premium_value.toFixed(2)}</b></div>
                  <div>VIP: <b>R$ {affiliate.subscriber_commission_vip_value.toFixed(2)}</b></div>
                  <div className="text-brava-muted">pagos no 1º pagamento</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "yellow" | "blue" }) {
  const toneCls = tone === "yellow"
    ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue"
    ? "border-brava-blue/30 bg-brava-blue/5"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${toneCls} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black text-brava-ink sm:text-2xl">{value}</div>
      {hint && <div className="mt-0.5 text-[10px] text-brava-muted">{hint}</div>}
    </div>
  );
}

function PipelinePill({ label, count, tone }: { label: string; count: number; tone?: "green" | "red" }) {
  const cls = tone === "green"
    ? "bg-green-100 border-green-300 text-green-900"
    : tone === "red"
    ? "bg-red-50 border-red-300 text-red-900"
    : "bg-brava-card border-brava-border text-brava-ink";
  return (
    <div className={`rounded-xl border ${cls} px-3 py-2 text-center`}>
      <div className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="text-xl font-black">{count}</div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
      {text}
    </div>
  );
}
