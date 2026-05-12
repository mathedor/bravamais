import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { RewardValidator } from "./validator";

export const metadata = { title: "Validar prêmios — Loja" };

interface RewardRow {
  id: string;
  reward_code: string;
  benefit_description: string;
  claimed_at: string;
  used_at: string | null;
  profiles: { full_name: string | null } | null;
}

export default async function RecompensasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { establishment } = await requireEstablishment();
  const { filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("loyalty_rewards")
    .select(
      "id, reward_code, benefit_description, claimed_at, used_at, profiles!loyalty_rewards_user_id_fkey(full_name)",
    )
    .eq("establishment_id", establishment.id)
    .order("claimed_at", { ascending: false });

  if (filter === "pending") query = query.is("used_at", null);
  if (filter === "used") query = query.not("used_at", "is", null);

  const { data } = await query.limit(50);
  const rows = (data as unknown as RewardRow[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Recompensas</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Validar prêmios da fidelidade</h1>
        <p className="mt-1 text-brava-muted">Cliente mostra o código, você valida e libera a recompensa.</p>
      </header>

      <section className="rounded-3xl border border-brava-yellow bg-brava-yellow/10 p-5">
        <RewardValidator />
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip href="/loja/recompensas" active={!filter}>Todas</FilterChip>
        <FilterChip href="/loja/recompensas?filter=pending" active={filter === "pending"}>Pendentes</FilterChip>
        <FilterChip href="/loja/recompensas?filter=used" active={filter === "used"}>Usadas</FilterChip>
      </div>

      <div className="mt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
            Nenhuma recompensa {filter ? "neste filtro" : "ainda"}.
          </p>
        ) : (
          rows.map((r) => (
            <article
              key={r.id}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-brava-card p-4 ${
                r.used_at ? "opacity-60 border-brava-border" : "border-brava-yellow"
              }`}
            >
              <span className="rounded-md bg-brava-yellow px-3 py-1 font-mono text-xs font-bold tracking-wider text-brava-black">
                {r.reward_code}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-brava-ink">{r.benefit_description}</p>
                <p className="text-xs text-brava-muted">
                  Cliente: <strong className="text-brava-ink">{r.profiles?.full_name ?? "—"}</strong>
                  {" · "}
                  resgatado em {new Date(r.claimed_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                r.used_at ? "bg-zinc-200 text-zinc-600" : "bg-green-100 text-green-700"
              }`}>
                {r.used_at ? "USADO" : "AGUARDANDO"}
              </span>
            </article>
          ))
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}

import Link from "next/link";

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-brava-card border border-brava-border text-brava-ink"}`}
    >
      {children}
    </Link>
  );
}
