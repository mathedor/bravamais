import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdChatBot, chatBotDeleteAction } from "@/app/api/tools/actions";

export default async function ChatBotPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: rules } = await supabase.from("chat_auto_replies").select("*").eq("establishment_id", establishment.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">auto-resposta</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Respostas automáticas (chat bot)</h1>
        <p className="text-sm text-brava-muted">Configure respostas pra perguntas frequentes. Quando cliente digitar a palavra-chave, BRAVA+ responde sozinho. Atendente só intervém em casos complexos.</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Nova regra</summary>
        <form action={fdChatBot} className="mt-3 space-y-3">
          <In label="Palavra-chave (gatilho) *" name="trigger_pattern" placeholder="ex: horário, delivery, entrega" required />
          <Tx label="Resposta automática *" name="reply_text" rows={3} required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar regra</button>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Regras ({rules?.length ?? 0})</h2>
        {rules && rules.length > 0 ? (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.id} className="rounded-2xl border border-brava-border bg-brava-card p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono font-bold text-brava-blue">/{r.trigger_pattern}</div>
                  <div className="flex items-center gap-2 text-xs text-brava-muted">
                    {r.fired_count} respostas · {r.is_active ? "ativa" : "pausada"}
                    <form action={chatBotDeleteAction.bind(null, r.id)}><button className="text-red-600">✕</button></form>
                  </div>
                </div>
                <div className="mt-1 text-brava-ink">"{r.reply_text}"</div>
              </li>
            ))}
          </ul>
        ) : <Empty />}
      </section>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Tx({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><textarea {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Empty() { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">Sem regras configuradas.</div>; }
