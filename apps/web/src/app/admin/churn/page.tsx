import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { ReactivateForm } from "./form";

export const metadata = { title: "Churn risk — Admin" };

interface ChurnRow {
  user_id: string;
  full_name: string | null;
  email: string;
  days_since_last_visit: number;
  total_visits: number;
  tier: string;
}

export default async function ChurnPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.rpc("churn_risk");
  const rows = (data as ChurnRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Risco de churn</h1>
        <p className="mt-1 text-sm text-brava-muted">
          {rows.length} assinantes ativos sem visita há &gt;30 dias. Mande um cupom de retenção.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          🎉 Sem risco de churn agora.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <article key={r.user_id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-brava-ink">
                    <Link href={`/admin/usuarios/${r.user_id}`} className="hover:underline">
                      {r.full_name ?? r.email}
                    </Link>
                    <span className="ml-2 rounded-full bg-brava-paper px-2 py-0.5 text-[10px] font-bold uppercase">
                      {r.tier}
                    </span>
                  </p>
                  <p className="text-[11px] text-brava-muted">{r.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brava-muted">Última visita</p>
                  <p className="text-base font-black text-rose-700">{r.days_since_last_visit === 999 ? "Nunca" : `${r.days_since_last_visit}d atrás`}</p>
                  <p className="text-[10px] text-brava-muted">{r.total_visits} visitas totais</p>
                </div>
              </div>
              <ReactivateForm userId={r.user_id} userName={r.full_name ?? "cliente"} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
