import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { createCampaignAction, dispatchCampaignAction, cancelCampaignAction } from "./actions";
import { EstimateAudienceButton } from "./estimate-button";

export const metadata = { title: "Admin · Campanhas" };

interface Campaign {
  id: string;
  name: string;
  title: string;
  body: string;
  link: string | null;
  segment: Record<string, unknown>;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipients_count: number;
  send_email: boolean;
  send_push: boolean;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  scheduled: "bg-amber-100 text-amber-800",
  sending: "bg-blue-100 text-blue-800",
  sent: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
  failed: "bg-rose-100 text-rose-700",
};

export default async function AdminCampaignsPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: campaigns }, { data: tiers }, { data: cats }] = await Promise.all([
    admin.from("campaigns").select("*").order("created_at", { ascending: false }).limit(100),
    admin.from("subscription_plans").select("tier").order("display_order"),
    admin.from("categories").select("slug, name").eq("is_active", true).order("display_order"),
  ]);

  const list = (campaigns as Campaign[] | null) ?? [];
  const tierList = (tiers as { tier: string }[] | null) ?? [];
  const catList = (cats as { slug: string; name: string }[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-brava-ink">Campanhas segmentadas</h1>
        <p className="mt-1 text-brava-muted">
          Crie pushes/notificações pra grupos específicos. Use pra datas comemorativas, anúncios e reativação.
        </p>
      </header>

      <section className="mb-10 rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="text-lg font-bold text-brava-ink">Nova campanha</h2>
        <form action={createCampaignAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="text-xs font-bold text-brava-ink">Nome interno</span>
            <input name="name" placeholder="Dia das Mães 2026" required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Título exibido</span>
            <input name="title" placeholder="🌹 Dia das Mães chegando!" required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-brava-ink">Mensagem</span>
            <textarea name="body" rows={3} placeholder="20% off em floriculturas parceiras..." required className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Link (opcional)</span>
            <input name="link" placeholder="/app/categoria/floriculturas" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold text-brava-ink">Agendar pra (opcional)</span>
            <input name="scheduled_at" type="datetime-local" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
          </label>

          <div className="rounded-2xl border border-brava-border bg-brava-paper p-3 sm:col-span-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Segmentação</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <span className="text-[11px] font-bold text-brava-ink">Categorias (slugs vírgula)</span>
                <input name="categories" placeholder={catList.slice(0, 3).map((c) => c.slug).join(", ")} className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm" />
                <p className="mt-1 text-[10px] text-brava-muted">
                  Opções: {catList.map((c) => c.slug).join(", ")}
                </p>
              </label>
              <label>
                <span className="text-[11px] font-bold text-brava-ink">Cidades (vírgula)</span>
                <input name="cities" placeholder="São Paulo, Jaraguá do Sul" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm" />
              </label>
              <label>
                <span className="text-[11px] font-bold text-brava-ink">Tiers</span>
                <input name="tiers" placeholder="vip, premium" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm" />
                <p className="mt-1 text-[10px] text-brava-muted">
                  Opções: {tierList.map((t) => t.tier).join(", ") || "basico, premium, vip"}
                </p>
              </label>
              <label>
                <span className="text-[11px] font-bold text-brava-ink">Mín. visitas</span>
                <input name="min_visits" type="number" defaultValue="0" className="mt-1 w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm" />
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="send_push" defaultChecked /> Push + notificação in-app
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="send_email" /> Também por email
            </label>
          </div>

          <EstimateAudienceButton />

          <button type="submit" className="sm:col-span-2 rounded-full bg-brava-blue px-6 py-2 font-bold text-white">
            Salvar / Agendar
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-brava-ink">Campanhas ({list.length})</h2>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Nenhuma campanha ainda.
          </p>
        ) : (
          <ul className="space-y-3">
            {list.map((c) => (
              <li key={c.id} className="rounded-3xl border border-brava-border bg-brava-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLOR[c.status] ?? "bg-zinc-100 text-zinc-700"}`}>
                        {c.status}
                      </span>
                      <p className="font-black text-brava-ink">{c.name}</p>
                    </div>
                    <p className="mt-1 text-sm font-bold text-brava-ink">{c.title}</p>
                    <p className="mt-0.5 text-xs text-brava-muted">{c.body.slice(0, 120)}{c.body.length > 120 && "…"}</p>
                    <p className="mt-2 text-[11px] text-brava-muted">
                      Segment: {Object.keys(c.segment ?? {}).length === 0 ? "(todos)" : JSON.stringify(c.segment)}
                      {" · "}
                      {c.sent_at ? `Enviado em ${new Date(c.sent_at).toLocaleString("pt-BR")} (${c.recipients_count} pessoas)` :
                        c.scheduled_at ? `Agendado pra ${new Date(c.scheduled_at).toLocaleString("pt-BR")}` : "Rascunho"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {(c.status === "draft" || c.status === "scheduled") && (
                      <>
                        <form action={dispatchCampaignAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                            Enviar agora
                          </button>
                        </form>
                        <form action={cancelCampaignAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-xs font-bold text-brava-ink">
                            Cancelar
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
