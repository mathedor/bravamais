import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { AffiliateForm } from "./form";

export const metadata = { title: "Afiliados comerciais — Admin" };

interface Affiliate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  code: string;
  commission_rate: number;
  duration_months: number;
  pix_key: string | null;
  is_active: boolean;
  created_at: string;
}

interface PayoutSummary {
  affiliate_id: string;
  estabs_count: number;
  total_revenue_cents: number;
  commission_cents: number;
}

export default async function AfiliadosPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await requireRole("admin");
  const { period } = await searchParams;
  const admin = createAdminClient();

  const periodDate = period
    ? new Date(period + "-01")
    : (() => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - 1);
        return d;
      })();
  const periodIso = periodDate.toISOString().slice(0, 10);
  const periodKey = periodIso.slice(0, 7);

  const [{ data: affs }, { data: payouts }, { data: refsRaw }] = await Promise.all([
    admin.from("commercial_affiliates").select("*").order("created_at", { ascending: false }),
    admin.rpc("calculate_affiliate_payouts", { p_period: periodIso }),
    admin
      .from("affiliate_referrals")
      .select("affiliate_id, establishment_id, signed_at, commission_until, establishments(name)")
      .order("signed_at", { ascending: false })
      .limit(200),
  ]);

  const affiliates = (affs as Affiliate[] | null) ?? [];
  const calcs = (payouts as PayoutSummary[] | null) ?? [];
  const calcMap = new Map(calcs.map((c) => [c.affiliate_id, c]));

  type Ref = { affiliate_id: string; establishment_id: string; signed_at: string; establishments: { name: string } | null };
  const refsRows = (refsRaw as unknown as Ref[] | null) ?? [];
  const refsByAff = new Map<string, Ref[]>();
  for (const r of refsRows) {
    const arr = refsByAff.get(r.affiliate_id) ?? [];
    arr.push(r);
    refsByAff.set(r.affiliate_id, arr);
  }

  const totalCommission = calcs.reduce((s, c) => s + c.commission_cents, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Comercial</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Afiliados comerciais</h1>
          <p className="mt-1 text-sm text-brava-muted">
            {affiliates.length} vendedores · Comissão {periodKey}: <strong>{formatBRL(totalCommission)}</strong>
          </p>
        </div>
        <form>
          <label className="text-xs font-bold text-brava-muted">
            Período (mês):
            <input name="period" type="month" defaultValue={periodKey} className="ml-2 rounded border border-brava-border bg-brava-paper px-2 py-1 text-xs" />
          </label>
          <button type="submit" className="ml-2 rounded-full bg-brava-blue px-3 py-1 text-xs font-bold text-white">Recalcular</button>
        </form>
      </header>

      <AffiliateForm />

      <section className="mt-8 space-y-3">
        {affiliates.map((a) => {
          const calc = calcMap.get(a.id);
          const myRefs = refsByAff.get(a.id) ?? [];
          return (
            <article key={a.id} className={`rounded-2xl border p-4 ${a.is_active ? "border-brava-border bg-brava-card" : "border-brava-border bg-brava-paper opacity-70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-brava-ink">
                    🤝 {a.name}
                    <code className="ml-2 rounded bg-brava-paper px-1.5 py-0.5 font-mono text-[10px]">{a.code}</code>
                  </p>
                  <p className="text-[11px] text-brava-muted">{a.email ?? ""}{a.phone ? ` · ${a.phone}` : ""}</p>
                  <p className="text-[10px] text-brava-muted">
                    {(a.commission_rate * 100).toFixed(0)}% por {a.duration_months} meses
                    {a.pix_key && ` · PIX: ${a.pix_key}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brava-muted">{periodKey}</p>
                  <p className="text-base font-black text-brava-ink">{formatBRL(calc?.commission_cents ?? 0)}</p>
                  <p className="text-[10px] text-brava-muted">{calc?.estabs_count ?? 0} estab · receita {formatBRL(calc?.total_revenue_cents ?? 0)}</p>
                </div>
              </div>

              {myRefs.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-brava-muted">{myRefs.length} estabelecimento(s) indicado(s)</summary>
                  <ul className="mt-2 space-y-1 pl-4">
                    {myRefs.slice(0, 10).map((r) => (
                      <li key={r.establishment_id} className="text-brava-ink">
                        • {r.establishments?.name ?? "—"} <span className="text-brava-muted">desde {new Date(r.signed_at).toLocaleDateString("pt-BR")}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              <p className="mt-3 text-[10px] text-brava-muted">
                Link de cadastro:{" "}
                <code className="rounded bg-brava-paper px-1">/cadastro-estabelecimento?aff={a.code}</code>
              </p>
            </article>
          );
        })}
      </section>

      <p className="mt-8 text-center text-xs text-brava-muted">
        <Link href="/admin" className="text-brava-blue hover:underline">← Voltar pro admin</Link>
      </p>
    </div>
  );
}
