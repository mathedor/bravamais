import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { resolveFraudSignalAction, runFraudScanNowAction } from "./actions";

export const metadata = { title: "Antifraude — Admin" };

interface FraudRow {
  user_id: string;
  establishment_id: string;
  full_name: string | null;
  estab_name: string;
  visits_in_window: number;
  window_start: string;
}

interface LogRow {
  id: string;
  user_id: string;
  establishment_id: string;
  kind: string;
  severity: string;
  evidence: Record<string, unknown> | null;
  created_at: string;
}

export default async function FraudePage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: live }, { data: log }] = await Promise.all([
    admin.rpc("fraud_signals"),
    admin
      .from("fraud_signals_log")
      .select("id, user_id, establishment_id, kind, severity, evidence, created_at")
      .is("resolved_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const rows = (live as FraudRow[] | null) ?? [];
  const logRows = (log as LogRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Antifraude</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Padrões suspeitos</h1>
          <p className="mt-1 text-sm text-brava-muted">
            Cliente com 6+ check-ins no mesmo estabelecimento em menos de 30 minutos nos últimos 30 dias.
          </p>
        </div>
        <form action={runFraudScanNowAction}>
          <button
            type="submit"
            className="rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700"
          >
            🔄 Rodar varredura agora
          </button>
        </form>
      </header>

      {/* Sinais ao vivo (computados na hora) */}
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-brava-muted">Sinais ao vivo</h2>
      {rows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-brava-muted">
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
                  <p className="text-xs">Estabelecimento:{" "}
                    <Link href="/admin/estabelecimentos" className="hover:underline">{r.estab_name}</Link>
                  </p>
                </div>
                <p className="text-xs">início {new Date(r.window_start).toLocaleString("pt-BR")}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Sinais registrados (log) — pendentes de resolução */}
      <h2 className="mb-2 mt-8 text-sm font-bold uppercase tracking-wider text-brava-muted">
        Registrados — pendentes ({logRows.length})
      </h2>
      {logRows.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-brava-muted">
          Nada pendente. Rode uma varredura pra registrar os sinais atuais.
        </p>
      ) : (
        <div className="space-y-2">
          {logRows.map((r) => (
            <article key={r.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-amber-900">
                    {r.severity === "high" ? "🔴" : r.severity === "medium" ? "🟠" : "🟡"} {r.kind}
                    {" · "}
                    <Link href={`/admin/usuarios/${r.user_id}`} className="hover:underline">ver usuário</Link>
                  </p>
                  <p className="text-xs text-amber-800">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
                  {r.evidence && (
                    <p className="mt-1 break-all font-mono text-[10px] text-amber-700">{JSON.stringify(r.evidence)}</p>
                  )}
                </div>
                <form action={resolveFraudSignalAction} className="flex shrink-0 items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    name="notes"
                    placeholder="Nota (opcional)"
                    className="w-36 rounded-lg border border-amber-300 bg-white px-2 py-1.5 text-xs outline-none"
                  />
                  <button type="submit" className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">
                    Resolver
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
