import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdTraining, trainingVideoDeleteAction } from "@/app/api/tools/actions";

export default async function TreinamentosAdmin() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data: videos } = await supabase.from("training_videos").select("*").order("audience").order("display_order");

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-black">Vídeos de treinamento</h1>
        <p className="text-sm text-brava-muted">Por público: usuario / lojista / entregador / comercial / admin</p>
      </header>

      <details className="rounded-2xl border border-brava-border bg-brava-card p-4">
        <summary className="cursor-pointer text-sm font-bold text-brava-blue">+ Novo vídeo</summary>
        <form action={fdTraining} className="mt-3 grid gap-3 sm:grid-cols-2">
          <Sel label="Público *" name="audience"><option value="lojista">Lojista</option><option value="usuario">Usuário</option><option value="entregador">Entregador</option><option value="comercial">Comercial</option><option value="admin">Admin</option></Sel>
          <In label="Título *" name="title" required />
          <In label="URL do vídeo (mp4)" name="video_url" placeholder="https://..." />
          <In label="Duração (s)" name="duration_seconds" type="number" defaultValue={60} />
          <In label="Tópico" name="topic" placeholder="ex: como criar cupom" />
          <In label="Ordem" name="display_order" type="number" defaultValue={100} />
          <In label="Descrição" name="description" className="sm:col-span-2" />
          <label className="flex items-center gap-2"><input type="checkbox" name="is_active" defaultChecked /> ativo</label>
          <div className="sm:col-span-2"><button className="rounded bg-brava-blue px-4 py-2 text-sm font-bold text-white">Criar</button></div>
        </form>
      </details>

      <table className="w-full overflow-hidden rounded-2xl border border-brava-border bg-brava-card text-sm">
        <thead className="bg-brava-paper text-xs uppercase"><tr><th className="px-3 py-2 text-left">Público</th><th className="px-3 py-2 text-left">Título</th><th className="px-3 py-2 text-left">URL</th><th className="px-3 py-2"></th></tr></thead>
        <tbody>
          {(videos ?? []).map((v) => (
            <tr key={v.id} className="border-t border-brava-border">
              <td className="px-3 py-2 font-mono text-xs">{v.audience}</td>
              <td className="px-3 py-2 font-bold">{v.title}</td>
              <td className="px-3 py-2 truncate text-xs text-brava-blue">{v.video_url}</td>
              <td className="px-3 py-2 text-right"><form action={trainingVideoDeleteAction.bind(null, v.id)}><button className="text-xs text-red-600">excluir</button></form></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function In({ label, className = "", ...p }: any) { return <label className={`block ${className}`}><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><input {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" /></label>; }
function Sel({ label, children, ...p }: any) { return <label className="block"><span className="mb-1 block text-xs font-bold uppercase text-brava-muted">{label}</span><select {...p} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select></label>; }
