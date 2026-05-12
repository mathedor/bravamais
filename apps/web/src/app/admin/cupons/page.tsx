import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Admin · Cupons" };

interface Row {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number | null;
  discount_cents: number | null;
  uses_count: number;
  is_active: boolean;
  establishments: { name: string; slug: string } | null;
}

export default async function AdminCupons() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("coupons")
    .select("id, code, description, discount_percent, discount_cents, uses_count, is_active, establishments(name, slug)")
    .order("uses_count", { ascending: false })
    .limit(200);
  const rows = (data as unknown as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Cupons</h1>
      <p className="mt-1 text-brava-muted">{rows.length} cupons no sistema</p>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Estabelecimento</th>
              <th className="px-4 py-3">Desconto</th>
              <th className="px-4 py-3 text-right">Usos</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-brava-muted">Sem cupons.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono text-xs font-bold">{r.code}</td>
                <td className="px-4 py-3">{r.establishments?.name ?? "—"}</td>
                <td className="px-4 py-3 font-bold text-brava-blue">
                  {r.discount_percent ? `${r.discount_percent}%` : r.discount_cents ? `-${formatBRL(r.discount_cents)}` : "—"}
                </td>
                <td className="px-4 py-3 text-right">{r.uses_count}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {r.is_active ? "ativo" : "pausado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
