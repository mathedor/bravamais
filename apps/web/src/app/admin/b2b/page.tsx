import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { B2BAccountForm } from "./form";
import { B2BAccountCard, type AccountWithInvites } from "./account-card";

export const metadata = { title: "BRAVA+ Empresas — Admin" };
export const dynamic = "force-dynamic";

interface Invite {
  id: string;
  account_id: string;
  email: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

export default async function B2BPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const [{ data: accData }, { data: invData }] = await Promise.all([
    admin.from("b2b_accounts").select("*").order("created_at", { ascending: false }),
    admin.from("b2b_invites").select("id, account_id, email, accepted_at, expires_at, created_at").order("created_at", { ascending: false }),
  ]);
  const invites = (invData as Invite[] | null) ?? [];
  const accs: AccountWithInvites[] = ((accData as Omit<AccountWithInvites, "invites">[] | null) ?? []).map((a) => ({
    ...a,
    invites: invites.filter((i) => i.account_id === a.id),
  }));

  const activeRevenue = accs
    .filter((a) => a.active)
    .reduce((s, a) => s + a.seats_used * a.monthly_cents_per_seat, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · B2B</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">BRAVA+ Empresas</h1>
        <p className="mt-1 text-sm text-brava-muted">
          {accs.length} contas · MRR ativo {formatBRL(activeRevenue)}
        </p>
        <p className="mt-1 text-xs text-brava-muted">
          Fluxo: crie a conta da empresa → convide os funcionários por email → cada um ativa o benefício em{" "}
          <code>/empresa/beneficio</code> (link vai no email do convite).
        </p>
      </header>

      <B2BAccountForm />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">Contas</h2>
        {accs.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Sem contas B2B ainda.
          </p>
        ) : (
          accs.map((a) => <B2BAccountCard key={a.id} account={a} />)
        )}
      </section>
    </div>
  );
}
