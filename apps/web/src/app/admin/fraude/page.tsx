import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Antifraude — Admin" };

interface FraudRow {
  user_id: string;
  establishment_id: string;
  full_name: string | null;
  estab_name: string;
  visits_in_window: number;
  window_start: string;
}

export default async function FraudePage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.rpc("fraud_signals");
  const rows = (data as FraudRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Antifraude</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Padrões suspeitos</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Cliente com 6+ check-ins no mesmo estabelecimento em menos de 30 minutos nos últimos 30 dias.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          🛡️ Sem sinais de fraude no momento.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <article key={r.user_id + r.establishment_id} className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-rose-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">
                    🚨 {r.visits_in_window} visitas em &lt;30min ·{" "}
                    <Link href={`/admin/usuarios/${r.user_id}`} className="hover:underline">
                      {r.full_name ?? "Cliente"}
                    </Link>
                  </p>
                  <p className="text-xs">
                    Estabelecimento:{" "}
                    <Link href={`/admin/estabelecimentos`} className="hover:underline">{r.estab_name}</Link>
                  </p>
                </div>
                <p className="text-xs">início {new Date(r.window_start).toLocaleString("pt-BR")}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
