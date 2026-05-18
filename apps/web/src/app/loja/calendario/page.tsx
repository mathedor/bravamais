import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdPromoCalendar, promoCalendarDeleteAction } from "@/app/api/tools/actions";

export default async function CalendarioPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const { data: events } = await supabase.from("promo_calendar_events").select("*").eq("establishment_id", establishment.id).gte("scheduled_at", since.toISOString()).order("scheduled_at");
  const { data: templates } = await supabase.from("seasonal_templates").select("*").eq("is_active", true);

  // Sugestões sazonais pro mês atual + próximo
  const m = new Date().getMonth() + 1;
  const suggest = (templates ?? []).filter((t) => t.month_start <= m + 1 && t.month_end >= m);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">calendário de promo</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Agenda de promoções</h1>
        <p className="text-sm text-brava-muted">Programe campanhas, evite choque de promo, organize o ano.</p>
      </header>

      {suggest.length > 0 && (
        <section className="rounded-2xl border-2 border-brava-yellow/40 bg-brava-yellow/10 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase text-brava-ink">💡 Sazonalidade sugerida</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {suggest.map((s) => (
              <div key={s.id} className="rounded-lg bg-white p-3 text-sm">
                <div className="font-bold">{s.icon} {s.name}</div>
                <div className="text-xs text-brava-muted">{s.suggested_title} · {s.suggested_discount_percent}%</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Agendar evento</summary>
        <form action={fdPromoCalendar} className="mt-3 grid gap-3 sm:grid-cols-2">
          <In label="Título *" name="title" required />
          <Sel label="Tipo *" name="kind"><option value="coupon">Cupom</option><option value="blast">Blast</option><option value="roleta">Roleta</option><option value="fidelidade">Fidelidade</option><option value="sazonal">Sazonal</option><option value="outro">Outro</option></Sel>
          <In label="Data/hora *" name="scheduled_at" type="datetime-local" required />
          <In label="Descrição" name="description" />
          <div className="sm:col-span-2"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Agendar</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Próximos eventos</h2>
        {events && events.length > 0 ? (
          <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-bold">{e.title}</div>
                  <div className="text-xs text-brava-muted">{e.kind} · {new Date(e.scheduled_at).toLocaleString("pt-BR")}</div>
                </div>
                <form action={promoCalendarDeleteAction.bind(null, e.id)}><button className="text-xs text-red-600">excluir</button></form>
              </li>
            ))}
          </ul>
        ) : <Empty />}
      </section>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
function Empty() { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-sm text-brava-muted">Calendário vazio.</div>; }
