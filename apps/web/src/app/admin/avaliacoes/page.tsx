import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { toggleReviewHiddenAction } from "./actions";

export const metadata = { title: "Avaliações — Admin" };

interface Review {
  id: string;
  rating: number;
  body: string | null;
  is_hidden: boolean;
  created_at: string;
  profile: { full_name: string | null } | null;
  establishment: { name: string; slug: string } | null;
}

export default async function AvaliacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireRole("admin");
  const { filter } = await searchParams;
  const admin = createAdminClient();

  let q = admin
    .from("reviews")
    .select("id, rating, body, is_hidden, created_at, profile:user_id(full_name), establishment:establishment_id(name, slug)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "ocultas") q = q.eq("is_hidden", true);
  else if (filter === "visiveis") q = q.eq("is_hidden", false);
  else if (filter === "baixas") q = q.lte("rating", 2);

  const { data } = await q;
  const rows = (data ?? []) as unknown as Review[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Moderação</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Avaliações</h1>
        <p className="mt-1 text-sm text-brava-muted">Avaliações ocultas não aparecem na página pública do estabelecimento.</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterLink label="Todas" href="/admin/avaliacoes" active={!filter} />
        <FilterLink label="Visíveis" href="/admin/avaliacoes?filter=visiveis" active={filter === "visiveis"} />
        <FilterLink label="Ocultas" href="/admin/avaliacoes?filter=ocultas" active={filter === "ocultas"} />
        <FilterLink label="Notas baixas (≤2)" href="/admin/avaliacoes?filter=baixas" active={filter === "baixas"} />
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          Nenhuma avaliação aqui.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <article key={r.id} className={`rounded-2xl border p-4 ${r.is_hidden ? "border-zinc-300 bg-zinc-100 opacity-70" : "border-brava-border bg-brava-card"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-brava-ink">
                    {"★".repeat(r.rating)}<span className="text-brava-border">{"★".repeat(Math.max(0, 5 - r.rating))}</span>
                    {" · "}
                    {r.establishment ? (
                      <Link href={`/admin/estabelecimentos/${r.establishment.slug}`} className="hover:underline">{r.establishment.name}</Link>
                    ) : "—"}
                  </p>
                  <p className="text-xs text-brava-muted">
                    {r.profile?.full_name ?? "Cliente"} · {new Date(r.created_at).toLocaleString("pt-BR")}
                    {r.is_hidden && <span className="ml-2 rounded bg-zinc-300 px-1.5 py-0.5 text-[10px] font-bold text-zinc-700">OCULTA</span>}
                  </p>
                  {r.body && <p className="mt-2 text-sm text-brava-ink">{r.body}</p>}
                </div>
                <form action={toggleReviewHiddenAction} className="shrink-0">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="hide" value={r.is_hidden ? "0" : "1"} />
                  <button
                    type="submit"
                    className={`rounded-full px-3 py-1.5 text-xs font-bold text-white ${r.is_hidden ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
                  >
                    {r.is_hidden ? "Reexibir" : "Ocultar"}
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

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-brava-blue text-white" : "border border-brava-border bg-brava-card text-brava-ink hover:bg-brava-paper"}`}>
      {label}
    </Link>
  );
}
