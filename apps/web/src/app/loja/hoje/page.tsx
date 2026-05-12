import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { StoryForm } from "./form";
import { deleteStoryAction } from "./actions";

export const metadata = { title: "Hoje — Stories" };

interface Story {
  id: string;
  media_url: string;
  caption: string | null;
  expires_at: string;
  views_count: number;
  created_at: string;
}

export default async function HojePage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data } = await supabase
    .from("establishment_stories")
    .select("id, media_url, caption, expires_at, views_count, created_at")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  const stories = (data as Story[] | null) ?? [];
  const active = stories.filter((s) => new Date(s.expires_at) > new Date());
  const expired = stories.filter((s) => new Date(s.expires_at) <= new Date());

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Hoje</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Stories da loja</h1>
        <p className="mt-1 text-brava-muted">Compartilhe promos, fotos do ambiente, novidades. Some sozinho depois de 24h.</p>
      </header>

      <section className="rounded-3xl border border-brava-border bg-white p-5">
        <h2 className="text-base font-bold text-brava-ink">Postar agora</h2>
        <div className="mt-4">
          <StoryForm />
        </div>
      </section>

      {active.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-yellow-deep">
            🟢 No ar agora ({active.length})
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {active.map((s) => (
              <StoryCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}

      {expired.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-brava-muted">
            Histórico ({expired.length})
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 opacity-60">
            {expired.slice(0, 6).map((s) => (
              <StoryCard key={s.id} story={s} expired />
            ))}
          </div>
        </section>
      )}

      {stories.length === 0 && (
        <p className="mt-8 rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-sm text-brava-muted">
          Nenhum story ainda. Posta o primeiro!
        </p>
      )}

      <div className="h-6" />
    </div>
  );
}

function StoryCard({ story, expired }: { story: Story; expired?: boolean }) {
  const expiresIn = expiresInLabel(story.expires_at);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-brava-border bg-white">
      <div className="relative aspect-[4/5] w-full bg-brava-paper">
        <Image src={story.media_url} alt={story.caption ?? "Story"} fill sizes="(max-width:768px) 50vw, 200px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          {story.caption && <p className="line-clamp-2 text-xs font-medium text-white">{story.caption}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 text-[11px]">
        {expired ? (
          <span className="text-brava-muted">expirado</span>
        ) : (
          <span className="font-bold text-brava-blue">{expiresIn}</span>
        )}
        <form action={deleteStoryAction}>
          <input type="hidden" name="id" value={story.id} />
          <button className="text-red-600 hover:underline" type="submit">excluir</button>
        </form>
      </div>
    </article>
  );
}

function expiresInLabel(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff < 0) return "expirado";
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h restantes`;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  return `${minutes}min restantes`;
}
