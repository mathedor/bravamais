import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { AddItemForm } from "./add-form";
import { RemoveBtn } from "./remove-btn";

export const metadata = { title: "Editar lista — Admin" };

export default async function ListEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: list }, { data: itemsRaw }, { data: estabs }] = await Promise.all([
    admin.from("editorial_lists").select("id, title, description, is_published").eq("id", id).maybeSingle(),
    admin
      .from("editorial_list_items")
      .select("position, note, establishments(id, slug, name, cover_url)")
      .eq("list_id", id)
      .order("position"),
    admin.from("establishments").select("id, name, slug").eq("is_active", true).order("name").limit(500),
  ]);

  if (!list) notFound();

  type ItemRow = { position: number; note: string | null; establishments: { id: string; slug: string; name: string; cover_url: string | null } | null };
  const items = (itemsRaw as unknown as ItemRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6">
        <Link href="/admin/listas" className="text-xs text-brava-blue hover:underline">← Listas</Link>
        <h1 className="mt-2 text-3xl font-black text-brava-ink">{list.title}</h1>
        <p className="mt-1 text-sm text-brava-muted">{list.description ?? ""}</p>
      </header>

      <AddItemForm listId={id} estabs={(estabs as { id: string; name: string }[] | null) ?? []} />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">{items.length} parceiro(s) na lista</h2>
        {items.map((it, idx) =>
          it.establishments ? (
            <article key={it.establishments.id} className="flex items-center justify-between rounded-2xl border border-brava-border bg-brava-card p-3">
              <div>
                <p className="font-bold text-brava-ink">
                  <span className="mr-1 text-brava-muted">#{idx + 1}</span>
                  {it.establishments.name}
                </p>
                <p className="text-[11px] text-brava-muted">pos {it.position}</p>
              </div>
              <RemoveBtn listId={id} estabId={it.establishments.id} />
            </article>
          ) : null,
        )}
      </section>
    </div>
  );
}
