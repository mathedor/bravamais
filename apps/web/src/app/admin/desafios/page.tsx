import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { ChallengeForm } from "./form";
import { ToggleActive, DeleteBtn } from "./actions-buttons";

export const metadata = { title: "Desafios — Admin" };

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
  is_active: boolean;
  cover_emoji: string | null;
}

export default async function AdminDesafiosPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: chList }, { data: categorias }] = await Promise.all([
    admin.from("monthly_challenges").select("*").order("ends_at", { ascending: false }),
    admin.from("categories").select("slug, name").eq("is_active", true).order("display_order"),
  ]);

  const challenges = (chList as Challenge[] | null) ?? [];
  const cats = (categorias as { slug: string; name: string }[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Engajamento</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Desafios mensais</h1>
        <p className="mt-1 text-sm text-brava-muted">Crie missões pra engajar usuários e dar coins.</p>
      </header>

      <ChallengeForm categorias={cats} />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">Desafios cadastrados</h2>
        {challenges.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Nenhum desafio.
          </p>
        ) : (
          challenges.map((c) => {
            const isPast = new Date(c.ends_at) < new Date();
            return (
              <article key={c.id} className={`rounded-2xl border p-4 ${c.is_active && !isPast ? "border-brava-yellow/40 bg-brava-yellow/5" : "border-brava-border bg-brava-card opacity-70"}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-brava-ink">
                      {c.cover_emoji} {c.title}
                      {isPast && <span className="ml-2 rounded-full bg-brava-paper px-2 py-0.5 text-[10px] uppercase">expirado</span>}
                    </p>
                    <p className="text-xs text-brava-muted">
                      {kindLabel(c.kind)} {c.target_category_slug && `· ${c.target_category_slug}`} · meta {c.target_n} · +{c.reward_coins} 🪙
                    </p>
                    <p className="text-[10px] text-brava-muted">
                      {new Date(c.starts_at).toLocaleDateString("pt-BR")} → {new Date(c.ends_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ToggleActive id={c.id} active={c.is_active} />
                    <DeleteBtn id={c.id} />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function kindLabel(k: string): string {
  return {
    visits_in_category: "🏷️ Visitas em categoria",
    coupons_redeemed: "🎟️ Cupons usados",
    distinct_estabs_visited: "🏪 Lojas distintas visitadas",
    gift_cards_purchased: "🎁 Vales comprados",
  }[k] ?? k;
}
