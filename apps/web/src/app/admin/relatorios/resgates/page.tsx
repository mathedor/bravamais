import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Resgates de cupom — Admin" };

interface Redemption {
  id: string;
  redeemed_at: string;
  discount_applied_cents: number | null;
  coupon: { code: string; establishment: { name: string } | null } | null;
  profile: { full_name: string | null } | null;
}

function brl(c: number | null | undefined) {
  return `R$ ${((c ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function ResgatesPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ count }, { data }] = await Promise.all([
    admin.from("coupon_redemptions").select("*", { count: "exact", head: true }),
    admin
      .from("coupon_redemptions")
      .select("id, redeemed_at, discount_applied_cents, coupon:coupon_id(code, establishment:establishment_id(name)), profile:user_id(full_name)")
      .order("redeemed_at", { ascending: false })
      .limit(500),
  ]);

  const rows = (data ?? []) as unknown as Redemption[];
  const totalDiscount = rows.reduce((s, r) => s + (r.discount_applied_cents ?? 0), 0);
  const byEstab = new Map<string, { cnt: number; disc: number }>();
  for (const r of rows) {
    const name = r.coupon?.establishment?.name ?? "—";
    const e = byEstab.get(name) ?? { cnt: 0, disc: 0 };
    e.cnt++; e.disc += r.discount_applied_cents ?? 0;
    byEstab.set(name, e);
  }
  const topEstab = [...byEstab.entries()].sort((a, b) => b[1].cnt - a[1].cnt).slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Relatório</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Resgates de cupom</h1>
        <p className="mt-1 text-sm text-brava-muted">Cupons usados pelos assinantes nos parceiros.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Resgates (total)" value={String(count ?? 0)} highlight />
        <Kpi label="Desconto dado (amostra 500)" value={brl(totalDiscount)} />
        <Kpi label="Na amostra recente" value={String(rows.length)} />
      </section>

      {topEstab.length > 0 && (
        <section className="mt-6 rounded-2xl border border-brava-border bg-brava-card p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Top estabelecimentos (amostra)</h2>
          <div className="space-y-1">
            {topEstab.map(([name, e]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-brava-ink">{name}</span>
                <span className="font-bold text-brava-blue">{e.cnt} resgates · {brl(e.disc)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Resgates recentes</h2>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">Nenhum resgate ainda.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brava-border">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-brava-paper text-left text-xs uppercase text-brava-muted">
                <tr><th className="p-3">Quando</th><th className="p-3">Cupom</th><th className="p-3">Loja</th><th className="p-3">Cliente</th><th className="p-3">Desconto</th></tr>
              </thead>
              <tbody>
                {rows.slice(0, 100).map((r) => (
                  <tr key={r.id} className="border-t border-brava-border">
                    <td className="p-3 text-xs text-brava-muted">{new Date(r.redeemed_at).toLocaleString("pt-BR")}</td>
                    <td className="p-3 font-mono text-xs">{r.coupon?.code ?? "—"}</td>
                    <td className="p-3">{r.coupon?.establishment?.name ?? "—"}</td>
                    <td className="p-3">{r.profile?.full_name ?? "—"}</td>
                    <td className="p-3 font-bold text-brava-blue">{brl(r.discount_applied_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black text-brava-ink sm:text-2xl">{value}</div>
    </div>
  );
}
