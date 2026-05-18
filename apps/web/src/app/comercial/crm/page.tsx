import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { KanbanBoard } from "@/components/comercial/kanban-board";

export default async function ComercialCRMPage() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const { data: prospects } = await supabase
    .from("commercial_prospects")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">crm pessoal</div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">CRM (Kanban)</h1>
          <p className="text-sm text-brava-muted">Mova prospects pelo funil. Quando bater Fechado, cadastre o lojista/assinante usando os atalhos.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/comercial/prospects"
            className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-bold text-brava-ink hover:bg-brava-paper"
          >
            🗺️ Adicionar pelo mapa
          </Link>
          <Link
            href="/comercial/crm/novo"
            className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white hover:bg-brava-blue-bright"
          >
            + Cadastro manual
          </Link>
        </div>
      </header>

      <KanbanBoard prospects={prospects ?? []} />
    </div>
  );
}
