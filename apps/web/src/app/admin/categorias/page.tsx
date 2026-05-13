import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { CategoryForm } from "./form";
import { CategoryRow } from "./row";

export const metadata = { title: "Categorias — Admin" };

interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export default async function AdminCategoriasPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.from("categories").select("*").order("display_order");
  const cats = (data as Category[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Categorias</h1>
        <p className="mt-1 text-sm text-brava-muted">{cats.length} categorias cadastradas.</p>
      </header>

      <CategoryForm />

      <section className="mt-8 space-y-2">
        {cats.map((c) => (
          <CategoryRow key={c.id} cat={c} />
        ))}
      </section>
    </div>
  );
}
