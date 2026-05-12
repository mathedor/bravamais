import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SortableTh } from "@/components/admin/sortable-th";
import { PeriodFilter } from "@/components/admin/period-filter";
import { periodStart } from "@/lib/period";
import { adminDeleteEstablishmentAction } from "./actions";

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
  searchParams: Promise<{ status?: string; q?: string; sort?: string; dir?: string; period?: string }>;
}) {
  await requireRole("admin");
  const { status, q, sort, dir, period } = await searchParams;
  const supabase = await createClient();

  const orderField = ["name", "city", "total_visits", "created_at"].includes(sort ?? "")
    ? sort!
    : "created_at";
  const asc = dir === "asc";

  let query = supabase
    .from("establishments")
    .select("id, slug, name, city, state, is_active, is_verified, total_visits, created_at")
    .order(orderField, { ascending: asc })
    .limit(300);

  if (status === "pending") query = query.eq("is_active", false);
  if (status === "active") query = query.eq("is_active", true);
  if (q) query = query.ilike("name", `%${q}%`);
  const startAt = periodStart(period);
  if (startAt) query = query.gte("created_at", startAt);

  const { data } = await query;
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Estabelecimentos</h1>
          <p className="mt-1 text-brava-muted">{rows.length} registros</p>
        </div>
        <Link href="/admin/estabelecimentos/novo" className="rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
          + Novo estabelecimento
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome…"
          className="rounded-full border border-brava-border bg-white px-4 py-2 text-sm outline-none focus:border-brava-yellow"
        />
        <button type="submit" className="rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white">Buscar</button>
        <span className="mx-2 h-5 w-px bg-brava-border" />
        <FilterLink href="/admin/estabelecimentos" active={!status}>Todos</FilterLink>
        <FilterLink href="/admin/estabelecimentos?status=active" active={status === "active"}>Ativos</FilterLink>
        <FilterLink href="/admin/estabelecimentos?status=pending" active={status === "pending"}>Pendentes</FilterLink>
      </form>

      <div className="mt-4">
        <PeriodFilter />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <SortableTh field="name" label="Nome" />
              <SortableTh field="city" label="Cidade" />
              <th className="px-4 py-3 text-left">Status</th>
              <SortableTh field="total_visits" label="Visitas" numeric />
              <SortableTh field="created_at" label="Cadastro" numeric />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-brava-muted">Sem registros.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} className="hover:bg-brava-paper">
                <td className="px-4 py-3 font-medium text-brava-ink">
                  <Link href={`/admin/estabelecimentos/${r.slug}`} className="hover:text-brava-blue">
                    {r.name}
                  </Link>
                </td>
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
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/estabelecimentos/${r.slug}`} className="text-xs font-bold text-brava-blue hover:underline">
                      360 →
                    </Link>
                    <Link href={`/admin/estabelecimentos/${r.slug}/operacao`} className="text-xs font-bold text-brava-ink hover:underline">
                      operação
                    </Link>
                    <form action={adminDeleteEstablishmentAction}>
                      <input type="hidden" name="estab_id" value={r.id} />
                      <button className="text-xs text-red-600 hover:underline" type="submit">excluir</button>
                    </form>
                  </div>
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
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-white border border-brava-border text-brava-ink"}`}>
      {children}
    </Link>
  );
}
