import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { PromoForm } from "./form";

export const metadata = { title: "Promoções — Loja" };

export default async function LojaPromocoes() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { count: assinantesAtivos } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .in("status", ["active", "trial"]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Promoções</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Avisar todos os assinantes</h1>
        <p className="mt-1 text-brava-muted">
          {assinantesAtivos ?? 0} assinantes BRAVA+ vão receber a notificação no app.
        </p>
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-6">
        <h2 className="text-base font-bold text-brava-ink">Nova promoção</h2>
        <p className="mt-1 text-xs text-brava-muted">
          A notificação leva o cliente direto pra página de <strong>{establishment.name}</strong>.
        </p>
        <div className="mt-4">
          <PromoForm />
        </div>
      </section>

      <p className="mt-6 text-xs text-brava-muted">
        💡 Dica: use stories da aba <strong>Hoje</strong> pra divulgar conteúdo do dia.
        Use Promoções pra <strong>ações pontuais</strong> que valem ser notificação.
      </p>
    </div>
  );
}
