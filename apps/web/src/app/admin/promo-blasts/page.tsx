import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Promo blasts — Admin" };

interface Blast {
  id: string;
  title: string;
  body: string | null;
  audience: string | null;
  sent_count: number | null;
  expires_at: string | null;
  created_at: string;
  establishment: { name: string; slug: string } | null;
  coupon: { code: string } | null;
}

const AUD_LABEL: Record<string, string> = {
  all_visitors: "Todos que já visitaram",
  recent_visitors: "Visitantes recentes",
  favorites: "Quem favoritou",
  nearby: "Por perto",
  all: "Todos",
};

export default async function PromoBlastsPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ count }, { data }] = await Promise.all([
    admin.from("promo_blasts").select("*", { count: "exact", head: true }),
    admin
      .from("promo_blasts")
      .select("id, title, body, audience, sent_count, expires_at, created_at, establishment:establishment_id(name, slug), coupon:coupon_id(code)")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);

  const rows = (data ?? []) as unknown as Blast[];
  const now = Date.now();
  const reach = rows.reduce((s, b) => s + (b.sent_count ?? 0), 0);
  const active = rows.filter((b) => b.expires_at && new Date(b.expires_at).getTime() > now).length;
  const byEstab = new Map<string, { cnt: number; reach: number }>();
  for (const b of rows) {
    const name = b.establishment?.name ?? "—";
    const e = byEstab.get(name) ?? { cnt: 0, reach: 0 };
    e.cnt++; e.reach += b.sent_count ?? 0;
    byEstab.set(name, e);
  }
  const topEstab = [...byEstab.entries()].sort((a, b) => b[1].reach - a[1].reach).slice(0, 10);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Moderação</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Promo blasts dos lojistas</h1>
        <p className="mt-1 text-sm text-brava-muted">Disparos de promoção que os estabelecimentos enviam pros assinantes (push + notificação).</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Disparos (total)" value={String(count ?? 0)} highlight />
        <Kpi label="Alcance (amostra)" value={String(reach)} />
        <Kpi label="Ativos agora" value={String(active)} highlight />
      </section>

      {topEstab.length > 0 && (
        <section className="mt-6 rounded-2xl border border-brava-border bg-brava-card p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Quem mais dispara (amostra)</h2>
          <div className="space-y-1">
            {topEstab.map(([name, e]) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <span className="text-brava-ink">{name}</span>
                <span className="font-bold text-brava-blue">{e.cnt} disparos · {e.reach} alcance</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-base font-bold text-brava-ink">Disparos recentes</h2>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Nenhum promo blast enviado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 100).map((b) => {
              const isActive = b.expires_at && new Date(b.expires_at).getTime() > now;
              return (
                <article key={b.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-brava-ink">
                        📣 {b.title}
                        {b.establishment && (
                          <>
                            {" · "}
                            <Link href={`/admin/estabelecimentos/${b.establishment.slug}`} className="text-brava-blue hover:underline">
                              {b.establishment.name}
                            </Link>
                          </>
                        )}
                      </p>
                      {b.body && <p className="mt-1 text-sm text-brava-muted">{b.body}</p>}
                      <p className="mt-1 text-[11px] text-brava-muted">
                        {new Date(b.created_at).toLocaleString("pt-BR")} · público: {AUD_LABEL[b.audience ?? ""] ?? b.audience ?? "—"}
                        {b.coupon?.code && <> · cupom <span className="font-mono">{b.coupon.code}</span></>}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-brava-blue">{b.sent_count ?? 0}</p>
                      <p className="text-[10px] uppercase text-brava-muted">alcance</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-zinc-200 text-zinc-600"}`}>
                        {isActive ? "ativo" : "expirado"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${highlight ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black text-brava-ink sm:text-2xl">{value}</div>
    </div>
  );
}
