import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

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
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  await requireRole("admin");
  const { role, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, role, city, state, created_at, is_active")
    .order("created_at", { ascending: false })
    .limit(200);
  if (role) query = query.eq("role", role);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data } = await query;
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Usuários</h1>
      <p className="mt-1 text-brava-muted">{rows.length} registros</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterLink href="/admin/usuarios" active={!role}>Todos</FilterLink>
        <FilterLink href="/admin/usuarios?role=subscriber" active={role === "subscriber"}>Assinantes</FilterLink>
        <FilterLink href="/admin/usuarios?role=establishment" active={role === "establishment"}>Estabelecimentos</FilterLink>
        <FilterLink href="/admin/usuarios?role=commercial" active={role === "commercial"}>Comerciais</FilterLink>
        <FilterLink href="/admin/usuarios?role=admin" active={role === "admin"}>Admins</FilterLink>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-brava-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brava-paper text-left text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-brava-muted">Sem registros.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium text-brava-ink">{r.full_name ?? r.id.slice(0, 8)}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-brava-paper px-2 py-0.5 text-xs">{r.role}</span></td>
                <td className="px-4 py-3 text-brava-muted">{r.city ? `${r.city}/${r.state ?? ""}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {r.is_active ? "ativo" : "inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
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
