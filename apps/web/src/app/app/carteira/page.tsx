import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { coinsToBRL } from "@/lib/coins";

export const metadata = { title: "Minha carteira" };

export default async function CarteiraPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [
    { data: profileFull },
    { data: redemptions },
    { data: giftCards },
    { data: rewards },
    { data: savings },
    { data: txs },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("coins_balance, referral_code")
      .eq("id", profile.id)
      .maybeSingle(),
    supabase
      .from("coupon_redemptions")
      .select("id, redeemed_at, discount_applied_cents, coupons(code, description, discount_percent, discount_cents, establishments(slug, name, cover_url))")
      .eq("user_id", profile.id)
      .order("redeemed_at", { ascending: false })
      .limit(20),
    supabase
      .from("gift_cards")
      .select("id, code, value_cents, remaining_cents, expires_at, redeemed_at, status, establishments(slug, name, cover_url)")
      .eq("granted_to_user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("loyalty_rewards")
      .select("id, reward_code, benefit_description, used_at, expires_at, establishments(slug, name, cover_url)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("user_savings")
      .select("coupons_used, total_saved_cents")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase
      .from("coin_transactions")
      .select("id, delta, reason, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  type CR = {
    id: string;
    redeemed_at: string;
    discount_applied_cents: number | null;
    coupons: {
      code: string;
      description: string | null;
      discount_percent: number | null;
      discount_cents: number | null;
      establishments: { slug: string; name: string; cover_url: string | null } | null;
    } | null;
  };
  type GC = {
    id: string;
    code: string;
    value_cents: number;
    remaining_cents: number;
    expires_at: string | null;
    redeemed_at: string | null;
    status: string;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  };
  type RW = {
    id: string;
    reward_code: string;
    benefit_description: string;
    used_at: string | null;
    expires_at: string | null;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  };

  const reds = (redemptions as unknown as CR[] | null) ?? [];
  const gifts = (giftCards as unknown as GC[] | null) ?? [];
  const rws = (rewards as unknown as RW[] | null) ?? [];

  const activeGifts = gifts.filter((g) => g.status === "paid" && g.remaining_cents > 0 && (!g.expires_at || new Date(g.expires_at) > new Date()));
  const activeRewards = rws.filter((r) => !r.used_at && (!r.expires_at || new Date(r.expires_at) > new Date()));
  const coins = profileFull?.coins_balance ?? 0;
  const referralCode = profileFull?.referral_code ?? "";
  const economySource = (savings as unknown as { coupons_used: number; total_saved_cents: number } | null) ?? null;
  const totalSaved = economySource?.total_saved_cents ?? 0;
  const giftsValue = activeGifts.reduce((sum, g) => sum + g.remaining_cents, 0);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Carteira</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">Tudo seu, em um só lugar</h1>
        <p className="mt-1 text-sm text-brava-muted">{activeRewards.length + activeGifts.length + reds.length} itens disponíveis</p>
      </header>

      {/* Hero: economia + coins */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black via-brava-blue to-brava-blue-bright p-6 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brava-yellow/30 blur-3xl" />
        <div className="relative grid gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-yellow">Você já economizou</p>
            <p className="mt-1 text-4xl font-black tracking-tight">{formatBRL(totalSaved)}</p>
            <p className="mt-0.5 text-xs text-white/65">com BRAVA+ até agora ({economySource?.coupons_used ?? 0} cupons usados)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">BRAVA Coins</p>
              <p className="mt-1 text-2xl font-black">{coins}</p>
              <p className="text-[10px] text-white/55">≈ {coinsToBRL(coins)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brava-yellow">Em vales</p>
              <p className="mt-1 text-2xl font-black">{formatBRL(giftsValue)}</p>
              <p className="text-[10px] text-white/55">saldo disponível</p>
            </div>
          </div>

          <Link
            href="/app/indique"
            className="inline-flex items-center justify-between rounded-2xl bg-brava-yellow px-4 py-3 text-xs font-bold text-brava-black hover:scale-[1.01]"
          >
            <span>🎁 Indique amigos · ganhe 50 coins por pessoa</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Atalho referral code */}
      {referralCode && (
        <section className="mt-4 flex items-center justify-between rounded-2xl border border-brava-border bg-brava-card px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">Seu código de indicação</p>
            <p className="font-mono text-lg font-black text-brava-ink">{referralCode}</p>
          </div>
          <Link href="/app/indique" className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white">
            Compartilhar
          </Link>
        </section>
      )}

      {/* Recompensas de fidelidade prontas pra usar */}
      {activeRewards.length > 0 && (
        <Section title="Prêmios de fidelidade" subtitle="Disponíveis para resgatar agora">
          <div className="space-y-2">
            {activeRewards.map((r) => (
              <article key={r.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                <div className="flex items-center gap-3">
                  {r.establishments?.cover_url && (
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                      <Image src={r.establishments.cover_url} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                      <Link href={`/app/estabelecimento/${r.establishments?.slug ?? ""}`} className="hover:underline">
                        {r.establishments?.name ?? "—"}
                      </Link>
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-brava-ink">{r.benefit_description}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <code className="rounded-md bg-brava-paper px-2 py-1 font-mono text-[11px] font-bold">{r.reward_code}</code>
                  <Link href="/app/premios" className="text-xs font-bold text-brava-blue hover:underline">
                    Como usar →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Vale-presentes */}
      {activeGifts.length > 0 && (
        <Section title="Vale-presentes" subtitle="Saldos ativos">
          <div className="space-y-2">
            {activeGifts.map((g) => (
              <article key={g.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                      <Link href={`/app/estabelecimento/${g.establishments?.slug ?? ""}`} className="hover:underline">
                        {g.establishments?.name ?? "—"}
                      </Link>
                    </p>
                    <p className="mt-1 text-2xl font-black text-brava-ink">{formatBRL(g.remaining_cents)}</p>
                    <p className="text-[10px] text-brava-muted">de {formatBRL(g.value_cents)}</p>
                  </div>
                  <code className="rounded-md bg-brava-paper px-2 py-1 font-mono text-[11px] font-bold">{g.code}</code>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}

      {/* Cupons usados (histórico) */}
      {reds.length > 0 && (
        <Section title="Cupons que você usou" subtitle="Histórico de economia">
          <div className="space-y-2">
            {reds.map((r) => {
              const disc =
                r.discount_applied_cents ??
                r.coupons?.discount_cents ??
                (r.coupons?.discount_percent ? r.coupons.discount_percent * 50 : 0); // estimativa
              return (
                <article key={r.id} className="rounded-2xl border border-brava-border bg-brava-card p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-brava-ink">
                        <Link href={`/app/estabelecimento/${r.coupons?.establishments?.slug ?? ""}`} className="hover:underline">
                          {r.coupons?.establishments?.name ?? "—"}
                        </Link>
                      </p>
                      <p className="text-[11px] text-brava-muted">
                        {new Date(r.redeemed_at).toLocaleDateString("pt-BR")} · {r.coupons?.code}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      -{formatBRL(disc)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      )}

      {/* Últimas transações de coins */}
      {(txs?.length ?? 0) > 0 && (
        <Section title="Movimentações de coins" subtitle="Últimas atividades">
          <div className="space-y-1">
            {(txs ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-brava-card px-3 py-2 text-xs">
                <div>
                  <p className="font-bold text-brava-ink">{reasonLabel(t.reason)}</p>
                  <p className="text-[10px] text-brava-muted">{new Date(t.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <span className={`font-mono font-bold ${t.delta > 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {t.delta > 0 ? "+" : ""}{t.delta} coins
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Vazio */}
      {activeRewards.length === 0 && activeGifts.length === 0 && reds.length === 0 && (
        <section className="mt-8 rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-5xl">🪙</p>
          <p className="mt-3 font-bold text-brava-ink">Sua carteira está vazia</p>
          <p className="mt-1 text-sm text-brava-muted">Use cupons, ganhe coins e veja seu saldo crescer.</p>
          <Link href="/app/buscar" className="mt-4 inline-block rounded-full bg-brava-blue px-5 py-2 text-xs font-bold text-white">
            Explorar parceiros
          </Link>
        </section>
      )}

      <div className="h-6" />
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2">
        <h2 className="text-lg font-black text-brava-ink">{title}</h2>
        {subtitle && <p className="text-[11px] text-brava-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function reasonLabel(r: string): string {
  switch (r) {
    case "visit": return "Check-in registrado";
    case "coupon_redeemed": return "Cupom usado";
    case "order_paid": return "Compra realizada";
    case "referral_bonus": return "Indicou um amigo";
    case "referral_welcome": return "Bônus de boas-vindas";
    case "birthday_gift": return "Presente de aniversário 🎂";
    case "redeem_reward": return "Resgate de recompensa";
    default: return r;
  }
}
