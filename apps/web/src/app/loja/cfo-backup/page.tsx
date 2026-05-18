import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdCfoBackup } from "@/app/api/tools/actions";

export default async function CfoBackupPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: cfg } = await supabase.from("cfo_backup_subscriptions").select("*").eq("establishment_id", establishment.id).maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">cfo backup</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Backup financeiro automático</h1>
        <p className="text-sm text-brava-muted">Receba semanal/mensal um email com KPIs + CSV pra sua contadora. Sem precisar lembrar de exportar.</p>
      </header>

      <form action={fdCfoBackup} className="space-y-3 rounded-2xl border border-brava-border bg-brava-card p-5">
        <In label="Email destino *" name="email" type="email" defaultValue={cfg?.email ?? ""} required />
        <Sel label="Frequência" name="frequency" defaultValue={cfg?.frequency ?? "weekly"}>
          <option value="weekly">Semanal (segunda-feira)</option>
          <option value="monthly">Mensal (dia 1)</option>
        </Sel>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={cfg?.is_active ?? true} /> ativa</label>
        <button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Salvar</button>
        {cfg?.last_sent_at && <div className="text-xs text-brava-muted">Último envio: {new Date(cfg.last_sent_at).toLocaleString("pt-BR")}</div>}
      </form>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
