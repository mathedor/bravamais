import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export const metadata = { title: "Clientes" };

interface VisitRow {
  user_id: string;
  count: number;
  last_visit: string;
}

export default async function ClientesPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  // Aggregate visits manually
  const { data: visits } = await supabase
    .from("visits")
    .select("user_id, created_at")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  const byUser = new Map<string, { count: number; last_visit: string }>();
  for (const v of (visits as { user_id: string; created_at: string }[] | null) ?? []) {
    const e = byUser.get(v.user_id);
    if (e) {
      e.count += 1;
    } else {
      byUser.set(v.user_id, { count: 1, last_visit: v.created_at });
    }
  }

  const userIds = Array.from(byUser.keys());
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, city, state")
        .in("id", userIds)
    : { data: [] };

  const profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const rows = userIds
    .map((id) => ({ id, ...byUser.get(id)!, profile: profilesById.get(id) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Clientes</h1>
      <p className="mt-1 text-brava-muted">Assinantes que visitaram sua loja.</p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3 text-right">Visitas</th>
              <th className="px-4 py-3 text-right">Última visita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-brava-muted">
                  Nenhum cliente registrado. Leia o QR de um assinante pra começar.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-brava-ink">{r.profile?.full_name ?? r.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-brava-muted">
                    {r.profile?.city ? `${r.profile.city}/${r.profile.state ?? ""}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brava-blue">{r.count}</td>
                  <td className="px-4 py-3 text-right text-xs text-brava-muted">
                    {new Date(r.last_visit).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
