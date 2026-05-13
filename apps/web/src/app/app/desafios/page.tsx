import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { recomputeChallengeProgress } from "@/lib/challenges";
import { ClaimButton } from "./claim-button";

export const metadata = { title: "Desafios mensais" };

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  target_category_slug: string | null;
  target_n: number;
  reward_coins: number;
  starts_at: string;
  ends_at: string;
  cover_emoji: string | null;
}

interface Progress {
  challenge_id: string;
  count: number;
  completed_at: string | null;
  claimed_at: string | null;
}

export default async function DesafiosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);

  // Recalcula antes de mostrar
  recomputeChallengeProgress(profile.id).catch(() => {});

  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: challenges }, { data: progress }] = await Promise.all([
    supabase
      .from("monthly_challenges")
      .select("id, title, description, kind, target_category_slug, target_n, reward_coins, starts_at, ends_at, cover_emoji")
      .eq("is_active", true)
      .gte("ends_at", new Date().toISOString())
      .order("ends_at", { ascending: true }),
    admin
      .from("challenge_progress")
      .select("challenge_id, count, completed_at, claimed_at")
      .eq("user_id", profile.id),
  ]);

  const challs = (challenges as Challenge[] | null) ?? [];
  const progMap = new Map(((progress as Progress[] | null) ?? []).map((p) => [p.challenge_id, p]));

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Desafios</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Missões do mês</h1>
        <p className="mt-1 text-sm text-brava-muted">Complete pra ganhar BRAVA Coins extras.</p>
      </header>

      {challs.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
          🎯 Sem desafios ativos agora. Volte semana que vem.
        </p>
      ) : (
        <div className="space-y-3">
          {challs.map((c) => {
            const p = progMap.get(c.id);
            const count = p?.count ?? 0;
            const pct = Math.min(100, Math.round((count / c.target_n) * 100));
            const complete = !!p?.completed_at;
            const claimed = !!p?.claimed_at;
            return (
              <article key={c.id} className={`rounded-3xl border-2 p-5 transition ${complete && !claimed ? "border-brava-yellow bg-gradient-to-br from-brava-yellow/15 to-amber-50" : "border-brava-border bg-brava-card"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{c.cover_emoji ?? "🏆"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-brava-ink">{c.title}</p>
                    {c.description && <p className="mt-0.5 text-xs text-brava-muted">{c.description}</p>}
                  </div>
                  <span className="rounded-full bg-brava-blue px-2 py-0.5 text-[10px] font-bold text-white">
                    +{c.reward_coins} 🪙
                  </span>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px] text-brava-muted">
                    <span>{count} / {c.target_n}</span>
                    <span>Até {new Date(c.ends_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="h-2 rounded-full bg-brava-paper overflow-hidden">
                    <div
                      className={`h-full transition-all ${complete ? "bg-emerald-500" : "bg-gradient-to-r from-brava-yellow to-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {complete && !claimed && (
                  <div className="mt-3">
                    <ClaimButton challengeId={c.id} reward={c.reward_coins} />
                  </div>
                )}
                {claimed && (
                  <p className="mt-3 text-xs font-bold text-emerald-700">✓ Recompensa resgatada</p>
                )}
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs">
        <Link href="/app/carteira" className="text-brava-blue hover:underline">← Ver carteira</Link>
      </p>
    </div>
  );
}
