import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { commercialCreateEstabFormAction } from "@/app/comercial/actions";

export default async function CadastroLojistaPage({
  searchParams,
}: {
  searchParams?: Promise<{ prospect?: string; name?: string }>;
}) {
  await requireCommercial();
  const supabase = await createClient();
  const { data: cats } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");

  const sp = (await searchParams) ?? {};
  const prospectId = sp.prospect ?? "";
  const prefName = sp.name ?? "";

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">cadastro assistido</div>
        <h1 className="text-2xl font-black tracking-tight">Cadastrar lojista</h1>
        <p className="text-sm text-brava-muted">
          A conta sai com o estab vinculado ao seu código. Você passa a ganhar comissão automaticamente.
        </p>
      </header>

      <form action={commercialCreateEstabFormAction} className="space-y-4 rounded-2xl border border-brava-border bg-brava-card p-5">
        <input type="hidden" name="prospect_id" value={prospectId} />

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase text-brava-muted">Dados do dono</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome completo *" name="full_name" required />
            <Input label="Email (login) *" name="email" type="email" required />
            <Input label="Telefone" name="phone" type="tel" />
            <Input label="Senha provisória" name="password" type="text" placeholder="auto gerada se vazio" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-bold uppercase text-brava-muted">Dados da loja</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome da loja *" name="estab_name" required defaultValue={prefName} />
            <Select label="Categoria" name="category_id">
              <option value="">—</option>
              {(cats ?? []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </Select>
            <Input label="Cidade *" name="city" required />
            <Input label="UF *" name="state" maxLength={2} required />
          </div>
        </section>

        <div className="flex justify-end gap-2 border-t border-brava-border pt-4">
          <a href="/comercial/cadastros" className="rounded-lg border border-brava-border px-4 py-2 text-sm font-bold text-brava-muted">Cancelar</a>
          <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
            Criar lojista
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
