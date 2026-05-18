import { requireRole } from "@/lib/auth-guard";
import { createCommercialAction } from "@/app/admin/comerciais/actions";

async function createCommercialFormAction(fd: FormData) {
  "use server";
  await createCommercialAction(undefined, fd);
}

export default async function NovoComercialPage() {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">novo comercial</div>
        <h1 className="text-2xl font-black tracking-tight">Cadastrar representante</h1>
        <p className="text-sm text-brava-muted">
          Criamos a conta dele (role=commercial) + commercial_affiliates com sua tabela de comissão. Ele recebe o código automaticamente.
        </p>
      </header>

      <form action={createCommercialFormAction} className="space-y-6 rounded-2xl border border-brava-border bg-brava-card p-5">
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Dados pessoais</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome completo *" name="name" required />
            <Input label="Email (login) *" name="email" type="email" required />
            <Input label="Telefone" name="phone" type="tel" />
            <Input label="Senha provisória *" name="password" type="text" defaultValue="Brava@2026!" required />
            <Input label="Território" name="territory" placeholder="ex: Zona Sul SP" />
            <Input label="Chave PIX (pra payout)" name="pix_key" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão por estabelecimento</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Tipo *" name="establishment_commission_kind" required>
              <option value="percent">Percentual da receita</option>
              <option value="fixed">Valor fixo no signup</option>
            </Select>
            <Input
              label="Valor *"
              name="establishment_commission_value"
              defaultValue="20"
              required
              helper="se % digite 20 (=20%); se fixo digite o R$"
            />
            <Input
              label="Duração (meses)"
              name="establishment_commission_months"
              type="number"
              defaultValue="12"
              helper="só se percentual"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão por assinante (varia por tier)</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <Select label="Tipo *" name="subscriber_commission_kind" required>
              <option value="percent">Percentual da mensalidade</option>
              <option value="fixed">Valor fixo no 1º pagamento</option>
            </Select>
            <Input label="Básico" name="subscriber_commission_basic_value" defaultValue="30" helper="% ou R$" />
            <Input label="Premium" name="subscriber_commission_premium_value" defaultValue="20" helper="% ou R$" />
            <Input label="VIP" name="subscriber_commission_vip_value" defaultValue="15" helper="% ou R$" />
          </div>
          <div className="mt-3">
            <Input label="Duração (meses)" name="subscriber_commission_months" type="number" defaultValue="6" helper="só se percentual" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Notas internas (não vê ele)</h2>
          <textarea name="notes" rows={3} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </section>

        <div className="flex justify-end gap-2 border-t border-brava-border pt-4">
          <a href="/admin/comerciais" className="rounded-lg border border-brava-border px-4 py-2 text-sm font-bold text-brava-muted">Cancelar</a>
          <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
            Criar comercial
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, helper, ...props }: { label: string; helper?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <input {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
      {helper && <span className="mt-1 block text-[10px] text-brava-muted">{helper}</span>}
    </label>
  );
}
function Select({ label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <select {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select>
    </label>
  );
}
