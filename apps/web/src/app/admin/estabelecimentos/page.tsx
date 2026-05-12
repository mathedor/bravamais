import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Admin · Estabelecimentos" };

interface Row {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  is_active: boolean;
  is_verified: boolean;
  total_visits: number;
  created_at: string;
}

export default async function AdminEstabelecimentos({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("admin");
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("establishments")
    .select("id, slug, name, city, state, is_active, is_verified, total_visits, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status === "pending") query = query.eq("is_active", false);
  if (status === "active") query = query.eq("is_active", true);

  const { data } = await query;
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Estabelecimentos</h1>
      <p className="mt-1 text-brava-muted">{rows.length} registros</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/estabelecimentos" active={!status}>Todos</FilterLink>
        <FilterLink href="/admin/estabelecimentos?status=active" active={status === "active"}>Ativos</FilterLink>
        <FilterLink href="/admin/estabelecimentos?status=pending" active={status === "pending"}>Pendentes</FilterLink>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Visitas</th>
              <th className="px-4 py-3 text-right">Cadastro</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-brava-muted">Sem registros.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-brava-ink">{r.name}</td>
                <td className="px-4 py-3 text-brava-muted">{r.city ? `${r.city}/${r.state ?? ""}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.is_active ? "ativo" : "pendente"}
                  </span>
                  {r.is_verified && <span className="ml-1 rounded-full bg-brava-blue px-2 py-0.5 text-xs text-white">✓</span>}
                </td>
                <td className="px-4 py-3 text-right font-bold">{r.total_visits}</td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/estabelecimentos/${r.slug}`} className="text-xs font-bold text-brava-blue hover:underline">
                    360 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${active ? "bg-brava-blue text-white" : "bg-white border border-brava-border text-brava-ink"}`}
    >
      {children}
    </Link>
  );
}
