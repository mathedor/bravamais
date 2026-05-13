import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { B2BAccountForm } from "./form";

export const metadata = { title: "BRAVA+ Empresas — Admin" };

interface Account {
  id: string;
  company_name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  seats_purchased: number;
  seats_used: number;
  monthly_cents_per_seat: number;
  active: boolean;
  created_at: string;
}

export default async function B2BPage() {
  await requireRole("admin");
  const admin = createAdminClient();
  const { data } = await admin.from("b2b_accounts").select("*").order("created_at", { ascending: false });
  const accs = (data as Account[] | null) ?? [];

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
      </header>

      <B2BAccountForm />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">Contas</h2>
        {accs.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center text-brava-muted">
            Sem contas B2B ainda.
          </p>
        ) : (
          accs.map((a) => (
            <article key={a.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-brava-ink">
                    🏢 {a.company_name}
                    {a.active ? null : <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">inativa</span>}
                  </p>
                  <p className="text-[11px] text-brava-muted">
                    {a.cnpj && `CNPJ ${a.cnpj} · `}
                    {a.contact_name ?? "—"} · {a.contact_email ?? "—"}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-brava-blue">{a.seats_used}/{a.seats_purchased} seats</p>
                  <p className="text-[11px] text-brava-ink font-bold">{formatBRL(a.seats_used * a.monthly_cents_per_seat)}/mês</p>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
