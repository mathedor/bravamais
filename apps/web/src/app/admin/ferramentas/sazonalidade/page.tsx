import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdSeasonal, seasonalTemplateDeleteAction } from "@/app/api/tools/actions";

export default async function SazonalidadePage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: items } = await supabase.from("seasonal_templates").select("*").order("month_start");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-black">Templates sazonais</h1>
        <p className="text-sm text-brava-muted">Pre-fills que o lojista vê quando chega a época (Festa Junina, Black Friday, etc).</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Novo template</summary>
        <form action={fdSeasonal} className="mt-3 grid gap-3 sm:grid-cols-3">
          <In label="Nome" name="name" required />
          <In label="Ícone (emoji)" name="icon" defaultValue="🎉" />
          <In label="Título sugerido" name="suggested_title" required />
          <In label="Mês inicial (1-12)" name="month_start" type="number" defaultValue={1} />
          <In label="Mês final (1-12)" name="month_end" type="number" defaultValue={1} />
          <In label="% desconto sugerido" name="suggested_discount_percent" type="number" defaultValue={20} />
          <In label="Descrição" name="description" className="sm:col-span-3" />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <div className="sm:col-span-3"><button className="rounded bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar</button></div>
        </form>
      </details>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((s) => (
          <li key={s.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
            <div className="text-3xl">{s.icon}</div>
            <div className="mt-2 font-bold">{s.name}</div>
            <div className="text-xs text-brava-muted">{s.suggested_title} · {s.suggested_discount_percent}%</div>
            <div className="text-[10px] text-brava-muted">meses {s.month_start}–{s.month_end}</div>
            <form action={seasonalTemplateDeleteAction.bind(null, s.id)} className="mt-2"><button className="text-xs text-red-600">excluir</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
