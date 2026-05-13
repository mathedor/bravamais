import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { CreateListForm } from "./form";
import { ListRow } from "./row";

export const metadata = { title: "Listas editoriais — Admin" };

interface ListRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  city: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export default async function AdminListasPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("editorial_lists")
    .select("id, slug, title, description, cover_url, city, is_published, display_order, created_at")
    .order("display_order");
  const lists = (data as ListRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Editorial</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Listas editoriais</h1>
        <p className="mt-1 text-sm text-brava-muted">Coleções curadas pra destacar no home dos usuários.</p>
      </header>

      <CreateListForm />

      <section className="mt-8 space-y-2">
        {lists.map((l) => (
          <ListRow key={l.id} list={l} />
        ))}
      </section>
    </div>
  );
}
