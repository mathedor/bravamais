import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Denúncias — Admin" };

interface Report {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
  reporter: { full_name: string | null } | null;
}

export default async function DenunciasPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("reports")
    .select("id, target_type, target_id, reason, detail, status, created_at, reporter:profiles!reports_reporter_user_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);
  const reports = (data as unknown as Report[] | null) ?? [];
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Denúncias</h1>
        <p className="mt-1 text-sm text-brava-muted">{openCount} abertas · {reports.length} no total</p>
      </header>

      {reports.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          🛡️ Sem denúncias.
        </p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <article key={r.id} className={`rounded-2xl border-2 p-4 ${r.status === "open" ? "border-rose-200 bg-rose-50" : "border-brava-border bg-brava-card"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-brava-ink">
                    🚩 {r.target_type} · <code className="font-mono text-xs">{r.target_id.slice(0, 8)}</code>
                  </p>
                  <p className="text-xs text-brava-muted">por {r.reporter?.full_name ?? "Cliente"}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.status === "open" ? "bg-rose-200 text-rose-800" : "bg-emerald-100 text-emerald-700"}`}>
                  {r.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-sm text-brava-ink"><strong>Motivo:</strong> {r.reason}</p>
              {r.detail && <p className="mt-1 text-xs text-brava-muted">{r.detail}</p>}
              <p className="mt-1 text-[10px] text-brava-muted">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
