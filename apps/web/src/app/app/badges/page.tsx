import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export default async function BadgesPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: allBadges }, { data: mine }] = await Promise.all([
    supabase.from("badges").select("*").eq("is_active", true).order("display_order"),
    supabase.from("user_badges").select("badge_id, earned_at, progress").eq("user_id", profile.id),
  ]);

  const earnedMap = new Map((mine ?? []).map((m) => [m.badge_id, m]));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">explorador</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Suas conquistas</h1>
        <p className="text-sm text-brava-muted">Badges + coins desbloqueados ao explorar a rede BRAVA+.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(allBadges ?? []).map((b) => {
          const earned = earnedMap.get(b.id);
          return (
            <div
              key={b.id}
              className={`rounded-2xl border-2 p-4 transition ${earned ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card opacity-70"}`}
            >
              <div className="text-4xl">{b.icon ?? "🏆"}</div>
              <div className="mt-2 font-black">{b.label}</div>
              {b.description && <div className="mt-1 text-xs text-brava-muted">{b.description}</div>}
              <div className="mt-2 text-xs">
                <b>{b.coins_reward}</b> BRAVA Coins · {earned ? `✅ ${new Date(earned.earned_at).toLocaleDateString("pt-BR")}` : "🔒 ainda não conquistado"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
