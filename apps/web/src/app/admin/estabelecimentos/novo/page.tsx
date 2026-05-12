import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { CreateEstablishmentForm } from "./form";

export const metadata = { title: "Novo estabelecimento — Admin" };

export default async function NovoEstabPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name, display_order")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <Link href="/admin/estabelecimentos" className="text-xs text-brava-muted">← Voltar</Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Cadastrar estabelecimento</h1>
      <p className="mt-1 text-brava-muted">Cria a loja já ativa + conta do dono pra ele acessar o /loja.</p>
      <div className="mt-8">
        <CreateEstablishmentForm categorias={cats ?? []} />
      </div>
    </div>
  );
}
