import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdSendGift } from "@/app/api/tools/actions";

export default async function PresentePessoalPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: estabs }, { data: sent }, { data: received }] = await Promise.all([
    supabase.from("establishments").select("id, name, city").eq("is_active", true).order("name").limit(100),
    supabase.from("personal_coupon_gifts").select("*, establishment:establishment_id(name)").eq("sender_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("personal_coupon_gifts").select("*, establishment:establishment_id(name), sender:sender_id(full_name)").eq("recipient_id", profile.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">presente pessoal</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Cupom-presente pra um amigo</h1>
        <p className="text-sm text-brava-muted">Crie um cupom da sua loja favorita e envie pra alguém específico.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Enviar novo presente</summary>
        <form action={fdSendGift} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase text-brava-muted">Loja parceira *</span>
            <select name="establishment_id" required className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">
              {(estabs ?? []).map((e) => <option key={e.id} value={e.id}>{e.name} · {e.city}</option>)}
            </select>
          </label>
          <In label="Email ou nome do amigo *" name="recipient_hint" required />
          <Sel label="Tipo de desconto *" name="discount_kind">
            <option value="percent">% off</option><option value="fixed">R$ fixo</option>
          </Sel>
          <In label="Valor (% ou R$) *" name="discount_value" defaultValue={15} type="number" required />
          <In label="Mensagem (opcional)" name="message" className="sm:col-span-2" />
          <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">🎁 Enviar</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Recebidos ({received?.length ?? 0})</h2>
        {received && received.length > 0 ? (
          <ul className="space-y-2">
            {received.map((g: any) => (
              <li key={g.id} className="rounded-xl border border-brava-yellow/40 bg-brava-yellow/5 p-3 text-sm">
                🎁 <b>{g.discount_kind === "percent" ? `${g.discount_value}% off` : `R$ ${g.discount_value} off`}</b> em {g.establishment.name} · de {g.sender?.full_name ?? "alguém"}
                {g.message && <div className="mt-1 italic text-brava-muted">"{g.message}"</div>}
                <div className="mt-1 font-mono text-[10px] text-brava-blue">código: {g.share_token.slice(0, 8).toUpperCase()}</div>
              </li>
            ))}
          </ul>
        ) : <Empty text="Nenhum presente recebido ainda." />}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Enviados ({sent?.length ?? 0})</h2>
        {sent && sent.length > 0 ? (
          <ul className="space-y-2">
            {sent.map((g: any) => (
              <li key={g.id} className="rounded-xl border border-brava-border bg-brava-card p-3 text-sm">
                Para <b>{g.recipient_hint ?? "amigo"}</b>: {g.discount_kind === "percent" ? `${g.discount_value}% off` : `R$ ${g.discount_value} off`} em {g.establishment.name}
                <div className="mt-1 text-[10px] text-brava-muted">Status: {g.status}</div>
              </li>
            ))}
          </ul>
        ) : <Empty text="Nenhum enviado ainda." />}
      </section>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">{text}</div>; }
