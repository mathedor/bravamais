import { requireRole } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Ativação — Admin" };
export const dynamic = "force-dynamic";

interface Row {
  user_id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  city: string | null;
  tier: string | null;
  sub_status: string | null;
  trial_ends_at: string | null;
  categories_set: boolean;
  visits: number;
  redemptions: number;
  orders: number;
  pos_sales: number;
  last_activity: string | null;
}

function stage(r: Row): { label: string; tone: string } {
  if (r.redemptions > 0 || r.pos_sales > 0 || r.orders > 0)
    return { label: "✅ Ativado (resgatou)", tone: "bg-emerald-100 text-emerald-700" };
  if (r.visits > 0) return { label: "🟡 Visitou, não resgatou", tone: "bg-amber-100 text-amber-700" };
  if (r.categories_set) return { label: "🟠 Escolheu categorias", tone: "bg-orange-100 text-orange-700" };
  return { label: "🔴 Só cadastrou", tone: "bg-rose-100 text-rose-700" };
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default async function AtivacaoPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("admin_activation_overview", { p_limit: 100 });
  const rows = ((data ?? []) as Row[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const kpi = {
    total: rows.length,
    ativados: rows.filter((r) => r.redemptions > 0 || r.pos_sales > 0 || r.orders > 0).length,
    visitaram: rows.filter((r) => r.visits > 0).length,
    parados: rows.filter((r) => r.visits === 0 && r.redemptions === 0 && r.orders === 0).length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Crescimento</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">🚀 Ativação — primeiros usuários</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Os últimos 100 assinantes reais (contas demo ficam de fora) e o que cada um fez. Fale 1-a-1 com
          quem travou.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          Erro ao carregar ({error.message}). Rode a migration 041.
        </p>
      ) : (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Cadastros", value: kpi.total },
              { label: "Ativados (resgataram)", value: kpi.ativados },
              { label: "Visitaram", value: kpi.visitaram },
              { label: "Parados no cadastro", value: kpi.parados },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-brava-border bg-brava-card p-4 text-center">
                <p className="text-3xl font-black text-brava-ink">{k.value}</p>
                <p className="text-[11px] text-brava-muted">{k.label}</p>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            {rows.length === 0 && (
              <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
                Nenhum assinante real ainda. Quando entrarem, aparecem aqui.
              </p>
            )}
            {rows.map((r) => {
              const s = stage(r);
              return (
                <article key={r.user_id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-brava-ink">
                        {r.full_name ?? "Sem nome"}{" "}
                        <span className="text-xs font-normal text-brava-muted">{r.email}</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-brava-muted">
                        Cadastro {fmtDate(r.created_at)}
                        {r.city && ` · ${r.city}`}
                        {r.tier && ` · ${r.tier} (${r.sub_status})`}
                        {r.trial_ends_at && r.sub_status === "trial" && ` · trial até ${fmtDate(r.trial_ends_at)}`}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${s.tone}`}>{s.label}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-brava-muted">
                    <span>👣 {r.visits} visitas</span>
                    <span>🎟️ {r.redemptions} cupons</span>
                    <span>🛍️ {r.orders} pedidos</span>
                    <span>🏪 {r.pos_sales} balcão</span>
                    <span>🕐 último uso: {fmtDate(r.last_activity)}</span>
                    <a href={`/admin/usuarios/${r.user_id}`} className="font-bold text-brava-blue hover:underline">
                      ver 360 →
                    </a>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
