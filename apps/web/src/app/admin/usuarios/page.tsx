import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SortableTh } from "@/components/admin/sortable-th";
import { PeriodFilter } from "@/components/admin/period-filter";
import { periodStart } from "@/lib/period";
import { adminDeleteUserAction } from "./actions";

export const metadata = { title: "Admin · Usuários" };

interface Row {
  id: string;
  full_name: string | null;
  role: string;
  city: string | null;
  state: string | null;
  created_at: string;
  is_active: boolean;
}

export default async function AdminUsuarios({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string; sort?: string; dir?: string; period?: string; status?: string }>;
}) {
  await requireRole("admin");
  const { role, q, sort, dir, period, status } = await searchParams;
  const supabase = await createClient();

  const orderField = ["full_name", "role", "city", "created_at"].includes(sort ?? "") ? sort! : "created_at";
  const asc = dir === "asc";

  let query = supabase
    .from("profiles")
    .select("id, full_name, role, city, state, created_at, is_active")
    .order(orderField, { ascending: asc })
    .limit(200);

  if (role) query = query.eq("role", role);
  if (q) query = query.ilike("full_name", `%${q}%`);
  const startAt = periodStart(period);
  if (startAt) query = query.gte("created_at", startAt);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "suspended") query = query.eq("is_active", false);

  const { data } = await query;
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Usuários</h1>
          <p className="mt-1 text-brava-muted">{rows.length} registros</p>
        </div>
        <Link href="/admin/usuarios/novo" className="rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
          + Novo usuário
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome…"
          className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm outline-none focus:border-brava-yellow"
        />
        <button type="submit" className="rounded-full bg-brava-black px-4 py-2 text-xs font-bold text-white">Buscar</button>
        <span className="mx-2 h-5 w-px bg-brava-border" />
        <FilterLink href="/admin/usuarios" active={!role}>Todas</FilterLink>
        <FilterLink href="/admin/usuarios?role=subscriber" active={role === "subscriber"}>Assinantes</FilterLink>
        <FilterLink href="/admin/usuarios?role=establishment" active={role === "establishment"}>Lojistas</FilterLink>
        <FilterLink href="/admin/usuarios?role=admin" active={role === "admin"}>Admins</FilterLink>
        <span className="mx-2 h-5 w-px bg-brava-border" />
        <FilterLink href="/admin/usuarios?status=active" active={status === "active"}>Ativos</FilterLink>
        <FilterLink href="/admin/usuarios?status=suspended" active={status === "suspended"}>Suspensos</FilterLink>
      </form>

      <div className="mt-4">
        <PeriodFilter />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <SortableTh field="full_name" label="Nome" />
              <SortableTh field="role" label="Role" />
              <SortableTh field="city" label="Cidade" />
              <th className="px-4 py-3 text-left">Status</th>
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
                  <Link href={`/admin/usuarios/${r.id}`} className="hover:text-brava-blue">
                    {r.full_name ?? r.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brava-paper px-2 py-0.5 text-xs">{r.role}</span>
                </td>
                <td className="px-4 py-3 text-brava-muted">{r.city ? `${r.city}/${r.state ?? ""}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {r.is_active ? "ativo" : "suspenso"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/usuarios/${r.id}`} className="text-xs font-bold text-brava-blue hover:underline">
                      360 →
                    </Link>
                    <form action={adminDeleteUserAction}>
                      <input type="hidden" name="user_id" value={r.id} />
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
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}>
      {children}
    </Link>
  );
}
