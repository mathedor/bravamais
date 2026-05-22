import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { BenefitCard } from "@/components/app/benefit-card";

export default async function BeneficiosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: grants } = await supabase
    .from("renewable_benefit_grants")
    .select("id, kind, value, headline, code, status, granted_at, expires_at, min_order_cents, establishment:establishment_id(name, slug, logo_url, city)")
    .eq("user_id", profile.id)
    .order("status", { ascending: true })
    .order("expires_at", { ascending: true });

  const ativos = (grants ?? []).filter((g) => g.status === "ativo");
  const historico = (grants ?? []).filter((g) => g.status !== "ativo").slice(0, 20);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">benefícios renováveis</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Seus benefícios do mês</h1>
        <p className="text-sm text-brava-muted">
          Cada loja parceira te dá um benefício. <strong>Use antes de renovar — não acumula!</strong> Se não usar, perde e recebe outro automaticamente.
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">
          🎁 Ativos ({ativos.length})
        </h2>
        {ativos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ativos.map((g: any) => <BenefitCard key={g.id} grant={g} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Você ainda não recebeu benefícios. Favorite ou visite parceiros pra começar a receber automaticamente!
          </div>
        )}
      </section>

      {historico.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Histórico</h2>
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {historico.map((g: any) => (
              <li key={g.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-bold text-brava-ink">{g.headline}</div>
                  <div className="text-xs text-brava-muted">{g.establishment?.name}</div>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${g.status === "usado" ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"}`}>
                  {g.status === "usado" ? "✓ usado" : "expirou"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
