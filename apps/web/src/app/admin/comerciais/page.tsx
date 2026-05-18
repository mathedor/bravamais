import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

function brl(cents: number | null | undefined) {
  return `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function AdminComerciaisPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: comerciais } = await supabase
    .from("commercial_affiliates")
    .select("id, name, email, code, territory, is_active, establishment_commission_kind, establishment_commission_value, subscriber_commission_kind, onboarded_at, created_at")
    .order("created_at", { ascending: false });

  // Conta estabs e subs por comercial
  const ids = (comerciais ?? []).map((c) => c.id);
  const { data: estabsCount } = await supabase
    .from("affiliate_referrals")
    .select("affiliate_id")
    .in("affiliate_id", ids);
  const { data: subsCount } = await supabase
    .from("subscriber_referrals")
    .select("affiliate_id")
    .in("affiliate_id", ids);

  const estabsBy = (estabsCount ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.affiliate_id] = (acc[r.affiliate_id] ?? 0) + 1;
    return acc;
  }, {});
  const subsBy = (subsCount ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.affiliate_id] = (acc[r.affiliate_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">representantes em campo</div>
          <h1 className="text-2xl font-black tracking-tight">Comerciais</h1>
          <p className="text-sm text-brava-muted">{comerciais?.length ?? 0} cadastrados</p>
        </div>
        <Link href="/admin/comerciais/novo" className="rounded-full bg-brava-blue px-4 py-2 text-sm font-bold text-white hover:bg-brava-blue-bright">
          + Cadastrar comercial
        </Link>
      </header>

      {comerciais && comerciais.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-brava-border">
          <table className="w-full text-sm">
            <thead className="bg-brava-paper text-xs uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Código</th>
                <th className="px-4 py-2 text-left">Território</th>
                <th className="px-4 py-2 text-left">Comissão estab</th>
                <th className="px-4 py-2 text-center">Estabs</th>
                <th className="px-4 py-2 text-center">Subs</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {comerciais.map((c) => (
                <tr key={c.id} className="border-t border-brava-border bg-brava-card">
                  <td className="px-4 py-2">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-brava-muted">{c.email}</div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{c.code}</td>
                  <td className="px-4 py-2 text-xs">{c.territory ?? "—"}</td>
                  <td className="px-4 py-2 text-xs">
                    {c.establishment_commission_kind === "percent"
                      ? `${(c.establishment_commission_value * 100).toFixed(1)}%`
                      : `R$ ${c.establishment_commission_value.toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2 text-center">{estabsBy[c.id] ?? 0}</td>
                  <td className="px-4 py-2 text-center">{subsBy[c.id] ?? 0}</td>
                  <td className="px-4 py-2 text-center">
                    {c.is_active ? (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">Ativo</span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/comerciais/${c.id}`} className="text-xs font-bold text-brava-blue hover:underline">
                      Editar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Nenhum comercial cadastrado. Comece criando o primeiro.
        </div>
      )}
    </div>
  );
}
