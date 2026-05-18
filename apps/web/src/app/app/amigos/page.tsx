import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export default async function AmigosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: friends } = await supabase
    .from("friendships")
    .select("*, user_a_profile:user_a(full_name, avatar_url), user_b_profile:user_b(full_name, avatar_url)")
    .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`)
    .eq("status", "accepted");

  // Última atividade dos amigos
  const friendIds = (friends ?? []).map((f: any) => f.user_a === profile.id ? f.user_b : f.user_a);
  const { data: stories } = friendIds.length > 0 ? await supabase
    .from("visits")
    .select("user_id, created_at, establishment:establishment_id(name, slug, cover_url), profile:user_id(full_name, avatar_url)")
    .in("user_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(20) : { data: [] };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">amigos</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Stories dos amigos</h1>
        <p className="text-sm text-brava-muted">Veja onde seus amigos BRAVA+ estão e descubra lugares novos.</p>
      </header>

      {stories && stories.length > 0 ? (
        <ul className="space-y-3">
          {stories.map((s: any, i) => (
            <li key={i} className="overflow-hidden rounded-2xl border border-brava-border bg-brava-card">
              {s.establishment?.cover_url && <img src={s.establishment.cover_url} alt="" className="aspect-video w-full object-cover" />}
              <div className="p-3 text-sm">
                <b>{s.profile?.full_name}</b> fez check-in em <a href={`/app/estabelecimento/${s.establishment?.slug}`} className="font-bold text-brava-blue">{s.establishment?.name}</a>
                <div className="text-xs text-brava-muted">{new Date(s.created_at).toLocaleString("pt-BR")}</div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Você ainda não tem amigos no BRAVA+. Convide pela tela "Indique e ganhe"!
        </div>
      )}
    </div>
  );
}
