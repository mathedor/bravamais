import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";

export default async function ComercialAgendaPage() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { data: items } = await supabase
    .from("commercial_prospects")
    .select("id, name, status, address, phone, next_action_at, next_action_label, kind")
    .eq("affiliate_id", affiliate.id)
    .not("next_action_at", "is", null)
    .order("next_action_at", { ascending: true });

  const overdue = (items ?? []).filter((i) => new Date(i.next_action_at!) < today);
  const today_items = (items ?? []).filter((i) => {
    const d = new Date(i.next_action_at!);
    return d >= today && d < new Date(today.getTime() + 86400000);
  });
  const week = (items ?? []).filter((i) => {
    const d = new Date(i.next_action_at!);
    return d >= new Date(today.getTime() + 86400000) && d < weekEnd;
  });
  const future = (items ?? []).filter((i) => new Date(i.next_action_at!) >= weekEnd);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">agenda</div>
        <h1 className="text-2xl font-black tracking-tight">Sua agenda</h1>
        <p className="text-sm text-brava-muted">Tudo que você marcou pra fazer, organizado pra você não esquecer.</p>
      </header>

      <Group title={`⚠️ Atrasadas (${overdue.length})`} items={overdue} empty="Sem tarefas atrasadas. 👍" tone="red" />
      <Group title={`📍 Hoje (${today_items.length})`} items={today_items} empty="Nada agendado pra hoje." tone="yellow" />
      <Group title={`📅 Próximos 7 dias (${week.length})`} items={week} empty="Sem tarefas próximas." />
      <Group title={`🗓️ Futuro (${future.length})`} items={future} empty="Sem tarefas futuras." />
    </div>
  );
}

function Group({ title, items, empty, tone }: { title: string; items: any[]; empty: string; tone?: "red" | "yellow" }) {
  const cls = tone === "red" ? "border-red-300" : tone === "yellow" ? "border-brava-yellow/50" : "border-brava-border";
  return (
    <section>
      <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-brava-ink">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-4 text-sm text-brava-muted">
          {empty}
        </div>
      ) : (
        <ul className={`divide-y divide-brava-border rounded-2xl border ${cls} bg-brava-card`}>
          {items.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <Link href={`/comercial/crm?prospect=${i.id}`} className="font-bold text-brava-ink hover:text-brava-blue">
                  {i.name}
                </Link>
                <div className="text-xs text-brava-muted">
                  {i.next_action_label ?? "Sem descrição"} {i.phone && <>· 📞 {i.phone}</>}
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-brava-blue">
                {new Date(i.next_action_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
