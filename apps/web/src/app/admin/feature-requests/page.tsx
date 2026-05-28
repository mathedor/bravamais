import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { centsToBRL } from "@/lib/feature-gate";
import { resolveFeatureRequestAction } from "./actions";

export const metadata = { title: "Admin · Pedidos de remoção" };

interface Row {
  id: string;
  establishment_id: string;
  feature_slug: string;
  reason: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  admin_note: string | null;
  establishment: { id: string; name: string; slug: string } | null;
  feature: { name: string; monthly_cents: number; category: string } | null;
}

export default async function AdminFeatureRequestsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data } = await supabase
    .from("establishment_feature_requests")
    .select("id, establishment_id, feature_slug, reason, status, created_at, resolved_at, admin_note, establishment:establishments(id, name, slug), feature:establishment_features(name, monthly_cents, category)")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data as unknown as Row[] | null) ?? [];
  const pending = rows.filter((r) => r.status === "pending");
  const resolved = rows.filter((r) => r.status !== "pending");

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-brava-ink">Pedidos de remoção</h1>
        <p className="mt-1 text-brava-muted">
          Lojistas solicitam aqui pra desligar uma feature. Aprovar = remove no próximo ciclo (não estorna o mês corrente).
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold text-brava-ink">Aguardando análise ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="rounded-2xl border border-brava-border bg-brava-card p-8 text-center text-brava-muted">
            Nenhum pedido pendente.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <article key={r.id} className="rounded-3xl border border-amber-300 bg-amber-50/70 p-5 dark:border-amber-700 dark:bg-amber-950/30">
                <header className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-brava-ink">
                      {r.establishment?.name ?? "Estabelecimento removido"}
                    </h3>
                    <p className="text-xs text-brava-muted">
                      quer remover: <strong className="text-brava-ink">{r.feature?.name ?? r.feature_slug}</strong> ({centsToBRL(r.feature?.monthly_cents ?? 0)}/mês)
                    </p>
                  </div>
                  <span className="text-xs text-brava-muted">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </header>
                {r.reason && (
                  <p className="mt-3 rounded-xl bg-white/60 p-3 text-sm italic text-brava-ink dark:bg-zinc-900/40">
                    “{r.reason}”
                  </p>
                )}
                <form action={resolveFeatureRequestAction} className="mt-4 flex flex-wrap items-center gap-3">
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    name="note"
                    placeholder="Observação interna (opcional)"
                    className="min-w-[200px] flex-1 rounded-xl border border-brava-border bg-white px-3 py-1.5 text-xs dark:bg-zinc-900"
                  />
                  <button
                    name="approve"
                    value="true"
                    type="submit"
                    className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-green-700"
                  >
                    Aprovar remoção
                  </button>
                  <button
                    name="approve"
                    value="false"
                    type="submit"
                    className="rounded-full border border-brava-border bg-white px-4 py-1.5 text-sm font-bold text-brava-ink hover:bg-brava-paper dark:bg-zinc-900"
                  >
                    Negar
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-brava-ink">Histórico ({resolved.length})</h2>
        <div className="overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
          <table className="w-full text-sm table-cards">
            <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
              <tr>
                <th className="px-4 py-3">Estabelecimento</th>
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Resolvido em</th>
                <th className="px-4 py-3">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brava-border">
              {resolved.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-brava-muted">Sem histórico ainda.</td></tr>
              ) : resolved.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.establishment?.name ?? "—"}</td>
                  <td className="px-4 py-3">{r.feature?.name ?? r.feature_slug}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      r.status === "approved" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {r.status === "approved" ? "aprovado" : "negado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-brava-muted">
                    {r.resolved_at ? new Date(r.resolved_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-brava-muted">{r.admin_note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
