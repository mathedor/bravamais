import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export default async function RecomendadosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  // Engine simples por horário + categorias mais visitadas
  const hour = new Date().getHours();
  const mealMode = hour >= 11 && hour <= 14 ? "almoço" : hour >= 18 && hour <= 22 ? "jantar" : hour >= 6 && hour <= 10 ? "café" : "noite";

  const { data: myVisits } = await supabase
    .from("visits")
    .select("establishment:establishment_id(category_id)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const cats: Record<string, number> = {};
  (myVisits ?? []).forEach((v: any) => {
    if (v.establishment?.category_id) cats[v.establishment.category_id] = (cats[v.establishment.category_id] ?? 0) + 1;
  });
  const topCats = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 3).map((c) => c[0]);

  const { data: recs } = await supabase
    .from("establishments")
    .select("id, slug, name, city, tagline, cover_url, category_id")
    .eq("is_active", true)
    .in("category_id", topCats.length ? topCats : ["00000000-0000-0000-0000-000000000000"])
    .limit(12);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">recomendado pra você</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Pra esse momento ({mealMode})</h1>
        <p className="text-sm text-brava-muted">Baseado no que você costuma frequentar + horário atual.</p>
      </header>

      {recs && recs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recs.map((r) => (
            <Link
              key={r.id}
              href={`/app/estabelecimento/${r.slug}`}
              className="overflow-hidden rounded-2xl border border-brava-border bg-brava-card transition hover:border-brava-yellow"
            >
              {r.cover_url && <img src={r.cover_url} alt="" className="aspect-video w-full object-cover" />}
              <div className="p-3">
                <div className="font-bold">{r.name}</div>
                <div className="text-xs text-brava-muted">{r.city}</div>
                {r.tagline && <div className="mt-1 line-clamp-2 text-xs text-brava-ink">{r.tagline}</div>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Ainda não temos dados suficientes pra recomendar. Faça algumas visitas e volte aqui — o sistema aprende.
        </div>
      )}
    </div>
  );
}
