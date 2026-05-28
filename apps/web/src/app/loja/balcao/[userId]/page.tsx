import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { BalcaoForm, type Benefit } from "./balcao-form";

export const metadata = { title: "Balcão BRAVA+" };

interface PageProps {
  params: Promise<{ userId: string }>;
}

interface BenefitsPayload {
  coupons: Array<{ ref_id: string; label: string; code: string; discount_percent: number | null; discount_cents: number | null; valid_until: string | null }>;
  gift_cards: Array<{ ref_id: string; label: string; code: string; remaining_cents: number; expires_at: string | null }>;
  loyalty_rewards: Array<{ ref_id: string; label: string; code: string; benefit_description: string }>;
  renewable_grants: Array<{ ref_id: string; label: string; code: string; benefit_subkind: string; benefit_value: number; expires_at: string; min_order_cents: number | null }>;
  loyalty_progress: { visits_required: number; visits_count: number; benefit_description: string } | null;
}

export default async function BalcaoPage({ params }: PageProps) {
  const { userId } = await params;
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: profile }, { data: payload }, { data: lastVisits }, { data: lastSales }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role")
      .eq("id", userId)
      .maybeSingle(),
    supabase.rpc("list_user_benefits_at_estab", { p_estab_id: establishment.id, p_user_id: userId }),
    supabase
      .from("visits")
      .select("created_at")
      .eq("establishment_id", establishment.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("pos_sales")
      .select("gross_cents, discount_cents, net_cents, created_at")
      .eq("establishment_id", establishment.id)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!profile) notFound();

  const data = (payload as BenefitsPayload | null) ?? {
    coupons: [],
    gift_cards: [],
    loyalty_rewards: [],
    renewable_grants: [],
    loyalty_progress: null,
  };

  const benefits: Benefit[] = [
    ...data.coupons.map((c) => ({
      kind: "coupon" as const,
      ref_id: c.ref_id,
      label: c.label,
      code: c.code,
      discount_percent: c.discount_percent,
      discount_cents: c.discount_cents,
    })),
    ...data.renewable_grants.map((r) => ({
      kind: "renewable" as const,
      ref_id: r.ref_id,
      label: r.label,
      code: r.code,
      benefit_subkind: r.benefit_subkind,
      benefit_value: r.benefit_value,
      min_order_cents: r.min_order_cents,
    })),
    ...data.loyalty_rewards.map((l) => ({
      kind: "loyalty_reward" as const,
      ref_id: l.ref_id,
      label: l.label,
      code: l.code,
    })),
    ...data.gift_cards.map((g) => ({
      kind: "gift_card" as const,
      ref_id: g.ref_id,
      label: g.label,
      code: g.code,
      remaining_cents: g.remaining_cents,
    })),
  ];

  const visitsCount = lastVisits?.length ?? 0;
  const totalSpent = (lastSales ?? []).reduce((sum, s: { gross_cents: number }) => sum + (s.gross_cents ?? 0), 0);
  const totalSaved = (lastSales ?? []).reduce((sum, s: { discount_cents: number }) => sum + (s.discount_cents ?? 0), 0);
  const avgTicket = lastSales && lastSales.length > 0
    ? totalSpent / lastSales.length / 100
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/loja/qr-scanner" className="mb-4 inline-block text-sm text-brava-blue hover:underline">
        ← Voltar pro scanner
      </Link>

      <header className="mb-6 flex items-center gap-4 rounded-3xl border border-brava-border bg-brava-card p-5">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name ?? "Cliente"}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brava-yellow to-amber-500 text-2xl font-black text-brava-blue">
            {(profile.full_name?.[0] ?? "B").toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Cliente</p>
          <h1 className="truncate text-2xl font-black text-brava-ink">{profile.full_name ?? "Sem nome"}</h1>
          <p className="text-xs text-brava-muted">
            {visitsCount === 0 ? "1ª visita registrada" : `${visitsCount} visitas no seu estab`}
            {avgTicket !== null && ` · ticket médio R$ ${avgTicket.toFixed(2).replace(".", ",")}`}
            {totalSaved > 0 && ` · já economizou R$ ${(totalSaved / 100).toFixed(2).replace(".", ",")} aqui`}
          </p>
        </div>
      </header>

      {data.loyalty_progress && data.loyalty_progress.visits_count < data.loyalty_progress.visits_required && (
        <div className="mb-6 rounded-2xl border border-brava-yellow/50 bg-brava-yellow/10 p-4">
          <p className="text-sm font-bold text-brava-ink">
            ⭐ Fidelidade: {data.loyalty_progress.visits_count}/{data.loyalty_progress.visits_required} visitas
          </p>
          <p className="mt-1 text-xs text-brava-muted">
            Faltam {data.loyalty_progress.visits_required - data.loyalty_progress.visits_count} pra ganhar: {data.loyalty_progress.benefit_description}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/40">
            <div
              className="h-full bg-brava-yellow"
              style={{ width: `${Math.min(100, (data.loyalty_progress.visits_count / data.loyalty_progress.visits_required) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <BalcaoForm userId={userId} userName={profile.full_name ?? ""} benefits={benefits} />
    </div>
  );
}
