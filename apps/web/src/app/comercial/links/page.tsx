import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { createInviteLinkFormAction, deleteInviteLinkAction } from "@/app/comercial/actions";
import { LinkRow } from "@/components/comercial/link-row";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";

export default async function ComercialLinksPage({
  searchParams,
}: {
  searchParams?: Promise<{ prospect?: string }>;
}) {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const sp = (await searchParams) ?? {};

  const { data: links } = await supabase
    .from("commercial_invite_links")
    .select("id, kind, label, token, clicks, signups, last_signup_at, expires_at, created_at, prospect:prospect_id(name)")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false });

  // Link "permanente" do código do comercial
  const permEstabUrl = `${APP_URL}/cadastro-estabelecimento?ref=${affiliate.code}`;
  const permSubUrl = `${APP_URL}/cadastro?ref=${affiliate.code}`;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">links de convite</div>
        <h1 className="text-2xl font-black tracking-tight">Links de cadastro</h1>
        <p className="text-sm text-brava-muted">
          Use os links permanentes pra divulgação geral. Crie links com label/expiração pra campanhas ou prospects específicos (tracking individual).
        </p>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Links permanentes (seu código {affiliate.code})</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkRow url={permEstabUrl} label="Link permanente — Lojista" tone="yellow" />
          <LinkRow url={permSubUrl} label="Link permanente — Assinante" tone="blue" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">+ Novo link com tracking</h2>
        <form action={createInviteLinkFormAction} className="grid gap-3 rounded-2xl border border-brava-border bg-brava-card p-4 sm:grid-cols-[1fr_180px_140px_auto]">
          <input
            name="label"
            placeholder="Label opcional (ex: Restaurante Pizzaria do Zé)"
            className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm"
          />
          <select name="kind" className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
            <option value="establishment">Lojista</option>
            <option value="subscriber">Assinante</option>
          </select>
          <select name="expires_in_days" className="rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
            <option value="7">7 dias</option>
            <option value="14">14 dias</option>
            <option value="30" defaultChecked>30 dias</option>
            <option value="90">90 dias</option>
          </select>
          {sp.prospect && <input type="hidden" name="prospect_id" value={sp.prospect} />}
          <button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Gerar link</button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Seus links ({links?.length ?? 0})</h2>
        {links && links.length > 0 ? (
          <div className="space-y-2">
            {links.map((l: any) => (
              <LinkRow
                key={l.id}
                url={`${APP_URL}/${l.kind === "establishment" ? "cadastro-estabelecimento" : "cadastro"}?ref=${l.token}`}
                label={`${l.label ?? "Sem label"} · ${l.kind === "establishment" ? "Lojista" : "Assinante"}`}
                meta={`👆 ${l.clicks} cliques · ✅ ${l.signups} signups${l.prospect ? ` · 🎯 ${l.prospect.name}` : ""}`}
                deleteAction={deleteInviteLinkAction.bind(null, l.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">
            Sem links com tracking ainda. Use os permanentes acima ou crie um novo.
          </div>
        )}
      </section>
    </div>
  );
}
