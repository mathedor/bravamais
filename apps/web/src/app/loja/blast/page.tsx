import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { BlastForm } from "./form";

export const metadata = { title: "Promo Flash — Loja" };

interface Blast {
  id: string;
  title: string;
  body: string;
  audience: string;
  sent_count: number;
  created_at: string;
  expires_at: string | null;
}

export default async function BlastPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();

  const [{ data: visitors90d }, { data: visitorsAll }, { data: ambassadors }, { data: history }] = await Promise.all([
    admin
      .from("visits")
      .select("user_id")
      .eq("establishment_id", establishment.id)
      .gte("created_at", new Date(Date.now() - 90 * 86400000).toISOString()),
    admin.from("visits").select("user_id").eq("establishment_id", establishment.id),
    admin.from("ambassadors").select("user_id").eq("establishment_id", establishment.id),
    admin
      .from("promo_blasts")
      .select("id, title, body, audience, sent_count, created_at, expires_at")
      .eq("establishment_id", establishment.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const recentSet = new Set(((visitors90d as { user_id: string }[] | null) ?? []).map((v) => v.user_id));
  const allSet = new Set(((visitorsAll as { user_id: string }[] | null) ?? []).map((v) => v.user_id));
  const ambSet = new Set(((ambassadors as { user_id: string }[] | null) ?? []).map((a) => a.user_id));
  const blasts = (history as Blast[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Promo Flash</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Tô vazio agora ⚡</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Dispara um cupom relâmpago pra base que já visitou sua loja. Aviso direto na notificação deles.
        </p>
      </header>

      {/* Audience preview */}
      <section className="mb-6 grid grid-cols-3 gap-2">
        <AudKpi label="Visitaram em 90d" value={`${recentSet.size}`} highlight />
        <AudKpi label="Todo o histórico" value={`${allSet.size}`} />
        <AudKpi label="Embaixadores VIP" value={`${ambSet.size}`} />
      </section>

      <BlastForm
        recent={recentSet.size}
        all={allSet.size}
        ambassadors={ambSet.size}
      />

      {/* Histórico */}
      {blasts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-black text-brava-ink">Disparos anteriores</h2>
          <div className="mt-2 space-y-2">
            {blasts.map((b) => (
              <article key={b.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-brava-ink">{b.title}</p>
                    <p className="text-xs text-brava-muted">{b.body}</p>
                  </div>
                  <div className="text-right text-[10px] text-brava-muted">
                    <p className="font-bold text-brava-blue">📨 {b.sent_count}</p>
                    <p>{new Date(b.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="h-8" />
    </div>
  );
}

function AudKpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${highlight ? "border-brava-yellow/40 bg-gradient-to-br from-brava-yellow/15 to-brava-yellow/5" : "border-brava-border bg-brava-card"}`}>
      <p className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-xl font-black text-brava-ink">{value}</p>
    </div>
  );
}
