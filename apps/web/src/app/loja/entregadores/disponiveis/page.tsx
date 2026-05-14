import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import type { Deliverer } from "@/lib/supabase/types";
import { hireFreelancerAction } from "../actions";

export const metadata = { title: "Freelancers BRAVA+" };

export default async function FreelancersPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  // Pega TODOS os freelancers aprovados; depois filtra os que já são vinculados a essa loja.
  const [{ data: freelancers }, { data: linked }] = await Promise.all([
    supabase
      .from("deliverers")
      .select("*")
      .eq("is_public_freelancer", true)
      .eq("status", "approved")
      .order("rating_avg", { ascending: false, nullsFirst: false }),
    supabase
      .from("establishment_deliverers")
      .select("deliverer_id")
      .eq("establishment_id", establishment.id),
  ]);

  const linkedIds = new Set((linked ?? []).map((r) => r.deliverer_id));
  const list = ((freelancers as Deliverer[] | null) ?? []).filter((d) => !linkedIds.has(d.id));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-brava-ink">Freelancers BRAVA+</h1>
          <p className="text-brava-muted">Entregadores cadastrados na rede pública. Contrate e adicione à sua equipe.</p>
        </div>
        <Link href="/loja/entregadores" className="text-sm text-brava-blue hover:underline">
          ← Equipe
        </Link>
      </header>

      <div className="mb-6 rounded-2xl border border-dashed border-brava-yellow bg-brava-yellow/10 p-4 text-xs text-brava-ink">
        ⚠️ Os entregadores são aprovados pela BRAVA+, mas a relação contratual e pagamento são exclusivamente entre
        você e o entregador. A BRAVA+ é apenas a ponte de contato.
      </div>

      {list.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          Nenhum freelancer disponível no momento. Voltamos quando houver novidades!
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((d) => (
            <article key={d.id} className="rounded-2xl border border-brava-border bg-brava-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-brava-yellow/20 text-lg font-black text-brava-blue">
                  {d.full_name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-brava-ink">{d.full_name}</p>
                  <p className="text-xs text-brava-muted">
                    {d.vehicle}
                    {d.vehicle_model ? ` · ${d.vehicle_model}` : ""}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-brava-ink">⭐ {d.rating_avg ? Number(d.rating_avg).toFixed(1) : "novo"}</p>
                  <p className="text-brava-muted">{d.total_deliveries} entregas</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <p className="text-brava-muted">
                  📱 {d.whatsapp ?? d.phone}
                </p>
                <p className="text-brava-muted">
                  📍 {d.city ?? "—"}/{d.state ?? ""}
                </p>
              </div>

              <form action={hireFreelancerAction} className="mt-4">
                <input type="hidden" name="deliverer_id" value={d.id} />
                <button className="w-full rounded-full bg-brava-blue px-4 py-2 text-sm font-bold text-white hover:scale-[1.01]">
                  Contratar — adicionar à equipe
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
