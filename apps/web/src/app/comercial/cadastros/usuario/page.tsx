import { requireCommercial } from "@/lib/commercial-guard";
import { commercialCreateSubFormAction } from "@/app/comercial/actions";

export default async function CadastroUsuarioPage({
  searchParams,
}: {
  searchParams?: Promise<{ prospect?: string; name?: string }>;
}) {
  await requireCommercial();
  const sp = (await searchParams) ?? {};
  const prospectId = sp.prospect ?? "";
  const prefName = sp.name ?? "";

  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">cadastro assistido</div>
        <h1 className="text-2xl font-black tracking-tight">Cadastrar assinante</h1>
        <p className="text-sm text-brava-muted">
          Conta criada com trial de 7 dias. Vinculada a você como comercial responsável.
        </p>
      </header>

      <form action={commercialCreateSubFormAction} className="space-y-4 rounded-2xl border border-brava-border bg-brava-card p-5">
        <input type="hidden" name="prospect_id" value={prospectId} />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Nome completo *" name="full_name" required defaultValue={prefName} />
          <Input label="Email (login) *" name="email" type="email" required />
          <Input label="Telefone" name="phone" type="tel" />
          <Input label="Senha provisória" name="password" type="text" placeholder="auto gerada se vazio" />
          <Select label="Tier inicial *" name="tier" required>
            <option value="basico">Básico (R$ 19,90/mês)</option>
            <option value="premium">Premium (R$ 39,90/mês)</option>
            <option value="vip">VIP (R$ 79,90/mês)</option>
          </Select>
        </div>

        <div className="rounded-lg border border-brava-blue/30 bg-brava-blue/5 p-3 text-xs text-brava-ink">
          Trial gratuito de 7 dias. Quando expirar, o sistema cobra automaticamente o tier escolhido (PIX/cartão configurado no app).
        </div>

        <div className="flex justify-end gap-2 border-t border-brava-border pt-4">
          <a href="/comercial/cadastros" className="rounded-lg border border-brava-border px-4 py-2 text-sm font-bold text-brava-muted">Cancelar</a>
          <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
            Criar assinante
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <input {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
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
