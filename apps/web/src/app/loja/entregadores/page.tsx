import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import type { Deliverer } from "@/lib/supabase/types";
import { DelivererForm } from "./form";
import { toggleDelivererActiveAction, unlinkDelivererAction } from "./actions";

export const metadata = { title: "Entregadores" };

interface PivotRow {
  id: string;
  is_active: boolean;
  hired_via: string;
  created_at: string;
  deliverers: Deliverer;
}

export default async function EntregadoresPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("establishment_deliverers")
    .select("id, is_active, hired_via, created_at, deliverers(*)")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  const list = (rows as unknown as PivotRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Entregadores</h1>
          <p className="text-brava-muted">Cadastre sua equipe ou contrate via vitrine pública BRAVA+.</p>
        </div>
        <Link
          href="/loja/entregadores/disponiveis"
          className="rounded-full border border-brava-blue bg-brava-blue/5 px-4 py-2 text-sm font-bold text-brava-blue hover:bg-brava-blue/10"
        >
          🔍 Buscar freelancers BRAVA+
        </Link>
      </header>

      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="text-lg font-bold text-brava-ink">Novo entregador da equipe</h2>
        <p className="text-xs text-brava-muted">
          BRAVA+ cria o login automaticamente e gera uma senha. O entregador acessa em /entrar com o email cadastrado.
        </p>
        <div className="mt-4">
          <DelivererForm />
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-bold text-brava-ink">Sua equipe ({list.length})</h2>
        {list.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Nenhum entregador vinculado ainda.
          </p>
        ) : (
          list.map((row) => {
            const d = row.deliverers;
            return (
              <article
                key={row.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-brava-border bg-brava-card p-4"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brava-yellow/20 font-black text-brava-blue">
                  {d.full_name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brava-ink">{d.full_name}</p>
                  <p className="text-xs text-brava-muted">
                    {d.phone} · {d.vehicle}
                    {d.plate ? ` · ${d.plate}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs text-brava-muted">
                  <p>⭐ {d.rating_avg ? Number(d.rating_avg).toFixed(1) : "—"} ({d.rating_count})</p>
                  <p>{d.total_deliveries} entregas</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    row.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {row.is_active ? "ativo" : "pausado"}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {row.hired_via === "bridge" ? "via BRAVA+" : "equipe"}
                </span>
                <form action={toggleDelivererActiveAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="is_active" value={String(row.is_active)} />
                  <button className="text-sm text-brava-blue hover:underline">{row.is_active ? "pausar" : "ativar"}</button>
                </form>
                <form action={unlinkDelivererAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <button className="text-sm text-red-600 hover:underline">remover</button>
                </form>
              </article>
            );
          })
        )}
      </section>

      <div className="mt-8 rounded-2xl border border-dashed border-brava-border bg-brava-paper p-5 text-xs text-brava-muted">
        ℹ️ A BRAVA+ apenas faz a ponte entre você e os entregadores. A relação contratual e o pagamento do entregador é
        de responsabilidade do estabelecimento.
      </div>
    </div>
  );
}
