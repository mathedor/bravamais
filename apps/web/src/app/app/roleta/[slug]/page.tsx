import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { Roleta } from "./roleta";

export const metadata = { title: "Roleta da sorte — BRAVA+" };

interface Prize {
  id: string;
  label: string;
  kind: "coupon" | "coins" | "nothing";
  value?: number;
  coupon_id?: string;
  weight: number;
}

export default async function RoletaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: estab } = await supabase
    .from("establishments")
    .select("id, name, slug, cover_url, logo_url")
    .eq("slug", slug)
    .maybeSingle();
  if (!estab) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-brava-muted">Estabelecimento não encontrado.</p>
        <Link href="/app" className="mt-2 inline-block text-brava-blue underline">Voltar</Link>
      </div>
    );
  }

  const { data: draw } = await admin
    .from("lucky_draws")
    .select("id, name, prizes, max_spins_per_user_day, is_active")
    .eq("establishment_id", estab.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!draw) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <p className="text-5xl">🎰</p>
        <p className="mt-3 font-bold text-brava-ink">A roleta dessa loja não está ativa</p>
        <Link href={`/app/estabelecimento/${slug}`} className="mt-4 inline-block text-brava-blue underline">
          Voltar pra loja
        </Link>
      </div>
    );
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todaySpins } = await admin
    .from("lucky_draw_spins")
    .select("id, prize_label, created_at")
    .eq("draw_id", draw.id)
    .eq("user_id", profile.id)
    .gte("created_at", todayStart.toISOString());

  const spinsToday = todaySpins?.length ?? 0;
  const canSpin = spinsToday < draw.max_spins_per_user_day;
  const prizes = (draw.prizes as Prize[]) ?? [];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">
          <Link href={`/app/estabelecimento/${slug}`} className="hover:underline">
            {estab.name}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">{draw.name}</h1>
        <p className="mt-1 text-sm text-brava-muted">
          {canSpin
            ? `Você tem ${draw.max_spins_per_user_day - spinsToday} giro(s) hoje. Boa sorte!`
            : "Volte amanhã pra girar de novo 🌅"}
        </p>
      </header>

      <Roleta drawId={draw.id} prizes={prizes} canSpin={canSpin} establishmentSlug={slug} />

      {(todaySpins?.length ?? 0) > 0 && (
        <section className="mt-6 rounded-3xl border border-brava-border bg-brava-card p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">Seus giros hoje</p>
          <ul className="mt-2 space-y-1">
            {todaySpins?.map((s) => (
              <li key={s.id} className="text-sm text-brava-ink">
                🎁 <strong>{s.prize_label}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
