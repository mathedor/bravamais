import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { CopyShareBlock } from "./copy-share-block";

export const metadata = { title: "Indique amigos" };

interface Referral {
  id: string;
  status: string;
  bonus_coins: number;
  created_at: string;
  confirmed_at: string | null;
  referred: { full_name: string | null } | null;
}

export default async function IndiquePage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [
    { data: profileFull },
    { data: refsRaw },
  ] = await Promise.all([
    supabase.from("profiles").select("referral_code, coins_balance").eq("id", profile.id).maybeSingle(),
    supabase
      .from("referrals")
      .select("id, status, bonus_coins, created_at, confirmed_at, referred:profiles!referrals_referred_user_id_fkey(full_name)")
      .eq("referrer_user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const referralCode = profileFull?.referral_code ?? "";
  const refs = (refsRaw as unknown as Referral[] | null) ?? [];
  const confirmed = refs.filter((r) => r.status === "confirmed");
  const pending = refs.filter((r) => r.status === "pending");
  const totalEarned = confirmed.reduce((s, r) => s + r.bonus_coins, 0);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";
  const shareUrl = `${appUrl}/cadastro?ref=${referralCode}`;
  const shareText = `Te dou 50 BRAVA Coins pra entrar no clube comigo. Usa meu código ${referralCode} 👉 ${shareUrl}`;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Indique amigos</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">Ganhe 50 coins por amigo</h1>
        <p className="mt-1 text-sm text-brava-muted">Vocês dois recebem 50 BRAVA Coins quando o amigo assinar.</p>
      </header>

      {/* Hero código */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-400 to-brava-yellow-deep p-6 text-brava-black shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brava-black/15 blur-3xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brava-blue">Seu código</p>
        <p className="mt-2 font-mono text-3xl font-black tracking-tight">{referralCode}</p>
        <p className="mt-3 text-xs text-brava-black/75">Compartilha esse link pelos seus apps favoritos:</p>
        <div className="mt-4">
          <CopyShareBlock shareUrl={shareUrl} shareText={shareText} />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-3 gap-2">
        <Kpi label="Confirmados" value={`${confirmed.length}`} />
        <Kpi label="Pendentes" value={`${pending.length}`} />
        <Kpi label="Coins ganhos" value={`${totalEarned}`} />
      </section>

      {/* Como funciona */}
      <section className="mt-5 rounded-2xl border border-brava-border bg-brava-card p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">Como funciona</p>
        <ol className="mt-2 space-y-2 text-sm text-brava-ink">
          <li className="flex gap-2"><span className="font-mono font-bold text-brava-blue">1.</span> Compartilha seu código com amigos</li>
          <li className="flex gap-2"><span className="font-mono font-bold text-brava-blue">2.</span> Ele se cadastra usando o código</li>
          <li className="flex gap-2"><span className="font-mono font-bold text-brava-blue">3.</span> Quando ele assinar (qualquer plano), vocês dois ganham 50 coins</li>
        </ol>
      </section>

      {/* Lista de indicados */}
      {refs.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-black text-brava-ink">Seus indicados</h2>
          <div className="mt-2 space-y-2">
            {refs.map((r) => (
              <article key={r.id} className="flex items-center justify-between rounded-2xl border border-brava-border bg-brava-card p-3">
                <div>
                  <p className="font-bold text-brava-ink">{r.referred?.full_name ?? "Amigo"}</p>
                  <p className="text-[11px] text-brava-muted">
                    Entrou em {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {r.status === "confirmed" ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    +{r.bonus_coins} coins ✓
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    Aguardando assinatura
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 text-center">
        <Link href="/app/carteira" className="text-xs font-bold text-brava-blue hover:underline">
          ← Voltar pra carteira
        </Link>
      </div>

      <div className="h-6" />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brava-border bg-brava-card p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-xl font-black text-brava-ink">{value}</p>
    </div>
  );
}
