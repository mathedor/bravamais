import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { fdMesaQr, mesaQrDeleteAction } from "@/app/api/tools/actions";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brava-mais.vercel.app";

export default async function MesaQrPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: mesas } = await supabase.from("mesa_qr").select("*").eq("establishment_id", establishment.id).order("label");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">mesa qr</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Pedido na mesa via QR</h1>
        <p className="text-sm text-brava-muted">
          Cliente escaneia QR da mesa → vê catálogo → pede e paga pelo BRAVA+ → cozinha recebe na TV.
        </p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Nova mesa</summary>
        <form action={fdMesaQr} className="mt-3 grid gap-3 sm:grid-cols-3">
          <In label="Label (ex: Mesa 1) *" name="label" required />
          <In label="Capacidade" name="capacity" type="number" defaultValue={4} />
          <label className="flex items-end gap-2"><input type="checkbox" name="is_active" defaultChecked /> ativa</label>
          <div className="sm:col-span-3"><button type="submit" className="rounded-lg bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar mesa</button></div>
        </form>
      </details>

      <section>
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Mesas ({mesas?.length ?? 0})</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(mesas ?? []).map((m) => {
            const url = `${APP_URL}/m/${m.token}`;
            return (
              <div key={m.id} className="rounded-2xl border border-brava-border bg-brava-card p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{m.label}</div>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${m.is_active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-700"}`}>
                    {m.is_active ? "ativa" : "pausada"}
                  </span>
                </div>
                <div className="text-xs text-brava-muted">{m.capacity} lugares · {m.scans ?? 0} scans</div>
                <div className="mt-2 break-all rounded bg-brava-paper p-2 font-mono text-[10px]">{url}</div>
                <a href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`} target="_blank" rel="noopener" className="mt-2 inline-block rounded bg-brava-blue px-3 py-1 text-[10px] font-bold text-white">
                  📷 Ver/baixar QR
                </a>
                <form action={mesaQrDeleteAction.bind(null, m.id)} className="mt-2"><button className="text-[10px] text-red-600">Excluir</button></form>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function In({ label, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
