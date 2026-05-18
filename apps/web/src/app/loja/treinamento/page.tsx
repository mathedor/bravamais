import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";

export default async function TreinamentoPage() {
  const { profile } = await requireEstablishment();
  const supabase = await createClient();

  const [{ data: videos }, { data: progress }] = await Promise.all([
    supabase.from("training_videos").select("*").eq("is_active", true).eq("audience", "lojista").order("display_order"),
    supabase.from("user_training_progress").select("video_id").eq("user_id", profile.id),
  ]);

  const watchedSet = new Set((progress ?? []).map((p) => p.video_id));

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">treinamento</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Aprenda a usar tudo do BRAVA+</h1>
        <p className="text-sm text-brava-muted">Vídeos curtos sobre cada feature. Marque os assistidos pra acompanhar progresso.</p>
      </header>

      {videos && videos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-2xl border border-brava-border bg-brava-card p-3">
              <div className="aspect-video rounded-lg bg-brava-paper">
                {v.video_url ? (
                  <video src={v.video_url} controls className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-brava-muted">vídeo em produção</div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="font-bold">{v.title}</div>
                {watchedSet.has(v.id) && <span className="text-green-700">✓</span>}
              </div>
              {v.description && <div className="text-xs text-brava-muted">{v.description}</div>}
              <div className="mt-1 text-[10px] text-brava-muted">{v.duration_seconds ? `${Math.ceil(v.duration_seconds / 60)} min` : ""}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Sem vídeos disponíveis. Admin BRAVA+ vai liberar em breve.
        </div>
      )}
    </div>
  );
}
