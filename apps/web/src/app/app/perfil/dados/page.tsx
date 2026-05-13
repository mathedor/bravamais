import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { DeleteAccountForm } from "./delete-form";
import { ExportButton } from "./export-button";

export const metadata = { title: "Seus dados (LGPD)" };

export default async function DadosPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data: pendingDeletion } = await supabase
    .from("deletion_requests")
    .select("scheduled_for, cancelled_at, processed_at")
    .eq("user_id", profile.id)
    .is("cancelled_at", null)
    .is("processed_at", null)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">LGPD</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">Seus dados</h1>
        <p className="mt-1 text-sm text-brava-muted">Exporte ou exclua tudo. Você manda.</p>
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-lg font-bold text-brava-ink">📦 Exportar meus dados</h2>
        <p className="mt-1 text-sm text-brava-muted">
          Baixa um JSON com perfil, visitas, cupons usados, vale-presentes, coins, notificações.
        </p>
        <div className="mt-3">
          <ExportButton />
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-5">
        <h2 className="text-lg font-bold text-rose-900">🗑️ Excluir minha conta</h2>
        {pendingDeletion ? (
          <div className="mt-2">
            <p className="text-sm text-rose-900">
              Sua exclusão está agendada para{" "}
              <strong>{new Date(pendingDeletion.scheduled_for).toLocaleString("pt-BR")}</strong>.
              Você pode cancelar até essa data.
            </p>
            <DeleteAccountForm cancellable />
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-rose-900">
              Solicitação efetivada em 7 dias. Tudo apagado permanentemente: cupons, vales, coins, histórico.
            </p>
            <DeleteAccountForm />
          </>
        )}
      </section>

      <p className="mt-6 text-center text-xs text-brava-muted">
        <Link href="/privacidade" className="text-brava-blue hover:underline">Política de privacidade</Link>
        {" · "}
        <Link href="/termos" className="text-brava-blue hover:underline">Termos de uso</Link>
      </p>

      <div className="h-6" />
    </div>
  );
}
