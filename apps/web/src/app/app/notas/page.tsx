import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { fdSaveNote } from "@/app/api/tools/actions";

export default async function NotasPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: notes } = await supabase
    .from("private_notes")
    .select("*, establishment:establishment_id(name, slug)")
    .eq("user_id", profile.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">notas privadas</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Seu diário BRAVA+</h1>
        <p className="text-sm text-brava-muted">Anote o que pedir, o que evitar, o que voltar a comer. Privado — só você vê.</p>
      </header>

      {notes && notes.length > 0 ? (
        <ul className="space-y-3">
          {notes.map((n: any) => (
            <li key={n.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <a href={`/app/estabelecimento/${n.establishment.slug}`} className="font-bold text-brava-blue">{n.establishment.name}</a>
                <span className="text-[10px] text-brava-muted">{new Date(n.updated_at).toLocaleDateString("pt-BR")}</span>
              </div>
              <form action={fdSaveNote}>
                <input type="hidden" name="establishment_id" value={n.establishment_id} />
                <textarea name="body" defaultValue={n.body} rows={3} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
                <button type="submit" className="mt-2 text-xs font-bold text-brava-blue">💾 Salvar</button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-sm text-brava-muted">
          Você ainda não tem notas. Em cada página de estabelecimento tem "+ Adicionar nota privada".
        </div>
      )}
    </div>
  );
}
