import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ActivateButton } from "./activate-button";

export const metadata = { title: "Benefício da sua empresa — BRAVA+" };
export const dynamic = "force-dynamic";

export default async function BeneficioEmpresaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let inviteInfo: { company: string; expires: string } | null = null;
  let alreadyActive = false;

  if (user?.email) {
    const admin = createAdminClient();
    const email = user.email.toLowerCase();
    const { data: accepted } = await admin
      .from("b2b_invites")
      .select("id, b2b_accounts(company_name, active)")
      .eq("email", email)
      .not("accepted_at", "is", null)
      .limit(1)
      .maybeSingle();
    if (accepted) {
      alreadyActive = true;
      const acc = accepted.b2b_accounts as unknown as { company_name: string } | null;
      inviteInfo = { company: acc?.company_name ?? "sua empresa", expires: "" };
    } else {
      const { data: invite } = await admin
        .from("b2b_invites")
        .select("id, expires_at, b2b_accounts(company_name, active)")
        .eq("email", email)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (invite) {
        const acc = invite.b2b_accounts as unknown as { company_name: string; active: boolean } | null;
        if (acc?.active) {
          inviteInfo = {
            company: acc.company_name,
            expires: new Date(invite.expires_at).toLocaleDateString("pt-BR"),
          };
        }
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">BRAVA+ Empresas</p>
      <h1 className="mt-2 text-3xl font-black text-brava-ink">Benefício da sua empresa 🎁</h1>

      {!user ? (
        <>
          <p className="mt-3 text-sm text-brava-muted">
            Sua empresa contratou o BRAVA+ pra você: descontos, cupons, clube de fidelidade e vantagens em
            dezenas de parceiros — sem custo nenhum pra você.
          </p>
          <p className="mt-2 text-sm text-brava-muted">
            Entre (ou crie sua conta) usando o <b>mesmo email em que recebeu o convite</b> e volte a esta
            página pra ativar.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/entrar" className="rounded-full bg-brava-black px-6 py-4 text-center text-base font-black text-brava-yellow">
              Entrar
            </Link>
            <Link href="/cadastro" className="rounded-full border border-brava-border px-6 py-4 text-center text-base font-black text-brava-ink">
              Criar minha conta
            </Link>
          </div>
        </>
      ) : alreadyActive ? (
        <>
          <p className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            ✅ Seu benefício da <b>{inviteInfo?.company}</b> já está ativo. Aproveite o clube!
          </p>
          <Link href="/app" className="mt-6 rounded-full bg-brava-black px-6 py-4 text-center text-base font-black text-brava-yellow">
            Ir pro app
          </Link>
        </>
      ) : inviteInfo ? (
        <>
          <p className="mt-3 text-sm text-brava-muted">
            A <b>{inviteInfo.company}</b> liberou um BRAVA+ Premium pra você ({user.email}). Convite válido
            até {inviteInfo.expires}.
          </p>
          <div className="mt-6">
            <ActivateButton />
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
            Não achei convite pendente pro email <b>{user.email}</b>. Confira se você entrou com o mesmo
            email em que recebeu o convite, ou fale com o RH da sua empresa.
          </p>
          <Link href="/app" className="mt-6 rounded-full border border-brava-border px-6 py-4 text-center text-base font-black text-brava-ink">
            Ir pro app
          </Link>
        </>
      )}
    </main>
  );
}
