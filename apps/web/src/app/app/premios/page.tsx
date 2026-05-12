import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Meus prêmios" };

interface Reward {
  id: string;
  reward_code: string;
  benefit_description: string;
  claimed_at: string;
  used_at: string | null;
  establishments: { slug: string; name: string; logo_url: string | null; cover_url: string | null } | null;
}

export default async function PremiosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("loyalty_rewards")
    .select(
      "id, reward_code, benefit_description, claimed_at, used_at, establishments(slug, name, logo_url, cover_url)",
    )
    .eq("user_id", profile.id)
    .order("claimed_at", { ascending: false });

  const list = (data as unknown as Reward[] | null) ?? [];
  const unused = list.filter((r) => !r.used_at);
  const used = list.filter((r) => r.used_at);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Recompensas</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meus prêmios</h1>
        <p className="mt-1 text-brava-muted">Conquistas do clube de fidelidade pra você apresentar.</p>
      </header>

      {unused.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-yellow-deep">
            🎉 Pra usar ({unused.length})
          </h2>
          <div className="space-y-3">
            {unused.map((r) => (
              <RewardCard key={r.id} reward={r} />
            ))}
          </div>
        </section>
      )}

      {used.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
            Já usados
          </h2>
          <div className="space-y-3 opacity-60">
            {used.map((r) => (
              <RewardCard key={r.id} reward={r} />
            ))}
          </div>
        </section>
      )}

      {list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-brava-ink">Você ainda não tem nenhum prêmio.</p>
          <p className="mt-1 text-sm text-brava-muted">Complete um clube de fidelidade pra desbloquear.</p>
          <Link href="/app/fidelidade" className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
            Ver meus clubes
          </Link>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}

function RewardCard({ reward }: { reward: Reward }) {
  return (
    <Link
      href={`/premio/${reward.reward_code}`}
      className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brava-blue via-brava-blue-bright to-brava-blue p-5 text-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        {reward.establishments?.logo_url ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-brava-yellow/40">
            <Image src={reward.establishments.logo_url} alt="" fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brava-yellow text-brava-blue">
            <span className="text-2xl font-black">⭐</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-yellow">{reward.establishments?.name ?? "—"}</p>
          <p className="mt-1 line-clamp-2 text-base font-bold">{reward.benefit_description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-md bg-brava-black/30 px-2 py-1 font-mono text-xs font-bold text-brava-yellow backdrop-blur">
          {reward.reward_code}
        </span>
        <span className="text-xs font-bold text-brava-yellow">
          {reward.used_at ? `✓ usado` : "Toque pra mostrar"}
        </span>
      </div>
    </Link>
  );
}
