import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { claimRewardAction } from "./actions";

export const metadata = { title: "Fidelidade" };

interface Progress {
  id: string;
  visits_count: number;
  completed_at: string | null;
  claimed_at: string | null;
  club_id: string;
  loyalty_clubs: {
    id: string;
    name: string;
    benefit_description: string;
    visits_required: number;
    establishments: { slug: string; name: string; logo_url: string | null; cover_url: string | null } | null;
  } | null;
}

export default async function FidelidadePage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: progressData }, { data: rewardsData }] = await Promise.all([
    supabase
      .from("loyalty_progress")
      .select(
        `id, visits_count, completed_at, claimed_at, club_id,
         loyalty_clubs(id, name, benefit_description, visits_required,
           establishments(slug, name, logo_url, cover_url))`,
      )
      .eq("user_id", profile.id)
      .order("visits_count", { ascending: false }),
    supabase
      .from("loyalty_rewards")
      .select("id, reward_code, used_at")
      .eq("user_id", profile.id)
      .is("used_at", null),
  ]);

  const progressList = (progressData as unknown as Progress[] | null) ?? [];
  const completedList = progressList.filter((p) => p.completed_at && !p.claimed_at);
  const ongoingList = progressList.filter((p) => !p.completed_at);
  const unusedRewards = (rewardsData ?? []).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Fidelidade</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-brava-ink sm:text-4xl">
            Sua jornada nos clubes
          </h1>
        </div>
        {unusedRewards > 0 && (
          <Link
            href="/app/premios"
            className="rounded-full bg-brava-yellow px-4 py-2 text-xs font-bold text-brava-black"
          >
            🎁 {unusedRewards} {unusedRewards === 1 ? "prêmio guardado" : "prêmios guardados"}
          </Link>
        )}
      </header>

      {completedList.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-yellow-deep">
            🎉 Resgatar agora ({completedList.length})
          </h2>
          <div className="space-y-3">
            {completedList.map((p) => (
              <ClubCard key={p.id} progress={p} completed />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
          Em andamento
        </h2>
        {ongoingList.length === 0 && completedList.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center">
            <p className="text-brava-ink">Você ainda não entrou em nenhum clube.</p>
            <p className="mt-1 text-sm text-brava-muted">Visite um parceiro e mostre sua carteirinha pra começar.</p>
            <Link href="/app/buscar" className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
              Buscar parceiros
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ongoingList.map((p) => (
              <ClubCard key={p.id} progress={p} />
            ))}
          </div>
        )}
      </section>

      <div className="h-6" />
    </div>
  );
}

function ClubCard({ progress, completed }: { progress: Progress; completed?: boolean }) {
  const club = progress.loyalty_clubs;
  if (!club) return null;
  const estab = club.establishments;
  const pct = Math.min(100, (progress.visits_count / club.visits_required) * 100);

  return (
    <article
      className={`overflow-hidden rounded-3xl border bg-white p-5 transition ${
        completed ? "border-brava-yellow ring-2 ring-brava-yellow/40" : "border-brava-border"
      }`}
    >
      <Link href={estab ? `/app/estabelecimento/${estab.slug}` : "#"} className="block">
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-brava-paper">
            {estab?.cover_url && (
              <span className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${estab.cover_url})` }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">{estab?.name ?? "—"}</p>
                <p className="mt-0.5 line-clamp-1 font-bold text-brava-ink">{club.name}</p>
              </div>
              {completed ? (
                <span className="shrink-0 rounded-full bg-brava-yellow px-3 py-1 text-[10px] font-bold text-brava-black">PRONTO</span>
              ) : (
                <span className="shrink-0 text-sm font-black text-brava-blue">
                  {progress.visits_count}/{club.visits_required}
                </span>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-brava-muted">{club.benefit_description}</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-brava-paper">
          <div
            className={`h-full rounded-full ${completed ? "bg-gradient-to-r from-brava-yellow to-amber-400" : "bg-gradient-to-r from-brava-blue to-brava-blue-bright"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </Link>

      {completed && (
        <form action={claimRewardAction} className="mt-4">
          <input type="hidden" name="progress_id" value={progress.id} />
          <button
            type="submit"
            className="w-full rounded-full bg-brava-yellow px-5 py-3 text-sm font-bold text-brava-black shadow-md hover:scale-[1.02] transition"
          >
            🎁 Resgatar recompensa
          </button>
        </form>
      )}
    </article>
  );
}
