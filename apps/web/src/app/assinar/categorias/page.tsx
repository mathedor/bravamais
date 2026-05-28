import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { CategoriesPicker, type CategoryOption } from "./categories-picker";

export const metadata = { title: "Suas categorias" };

interface SubscriptionSummary {
  subscription_id: string | null;
  status: string | null;
  trial_ends_at: string | null;
  in_trial: boolean;
  custom_categories_set: boolean;
  categories_total_cents: number;
  categories: Array<{ id: string; slug: string; name: string; monthly_cents: number }>;
}

export default async function CategoriasPage() {
  await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: cats }, { data: summary }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, icon, monthly_cents, pitch")
      .eq("is_active", true)
      .order("monthly_cents", { ascending: false })
      .order("display_order"),
    supabase.rpc("user_subscription_summary", { p_user_id: undefined }),
  ]);

  // a RPC user_subscription_summary é chamada com auth.uid() embutido — bypass via select
  const { data: { user } } = await supabase.auth.getUser();
  const realSummary = user
    ? await supabase.rpc("user_subscription_summary", { p_user_id: user.id })
    : { data: null };
  const sub = (realSummary.data ?? summary) as SubscriptionSummary | null;

  const categories: CategoryOption[] = (cats ?? []) as CategoryOption[];
  const selectedIds: string[] = (sub?.categories ?? []).map((c) => c.id);

  return (
    <main className="min-h-screen bg-brava-paper text-brava-ink">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <Link href="/app" className="text-sm text-brava-blue hover:underline">
            ← Voltar pro app
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Minha assinatura</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Escolha suas categorias</h1>
          <p className="mt-2 max-w-2xl text-brava-muted">
            Você paga só pelas categorias de estabelecimento que vai usar de verdade. Acadêmico, cinema e
            saúde têm valor agregado maior (academia, sessões frequentes), enquanto decoração e papelaria são bem
            baratos.
          </p>
        </header>

        <CategoriesPicker
          categories={categories}
          initiallySelected={selectedIds}
          inTrial={!!sub?.in_trial}
          trialEndsAt={sub?.trial_ends_at ?? null}
        />

        <footer className="mt-10 rounded-2xl border border-brava-border bg-brava-card p-5 text-sm text-brava-muted">
          <strong className="text-brava-ink">Como funciona:</strong> durante o trial top você acessa
          tudo. Quando o trial acabar, a busca, o 360 dos estabs e o balcão só liberam benefícios das
          categorias que você manteve aqui. Pode mexer a qualquer momento — adiciona uma categoria nova
          e cobra pro-rata; tira e libera no próximo ciclo.
        </footer>
      </div>
    </main>
  );
}
