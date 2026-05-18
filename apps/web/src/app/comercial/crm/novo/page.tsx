import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { createProspectFormAction } from "@/app/comercial/actions";

export default async function ProspectNovoPage() {
  await requireCommercial();
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("slug, name").eq("is_active", true);

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">novo prospect</div>
        <h1 className="text-2xl font-black tracking-tight">Cadastro manual de prospect</h1>
        <p className="text-sm text-brava-muted">Use pra leads que vieram offline (rua, indicação, evento).</p>
      </header>

      <form action={createProspectFormAction} className="space-y-4 rounded-2xl border border-brava-border bg-brava-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Tipo *" name="kind" required>
            <option value="establishment">Estabelecimento</option>
            <option value="subscriber">Assinante (pessoa física)</option>
          </Select>
          <Input label="Nome *" name="name" required />
          <Input label="Nome do contato" name="contact_name" />
          <Input label="Telefone / WhatsApp" name="phone" type="tel" />
          <Input label="Email" name="email" type="email" />
          <Input label="CNPJ" name="cnpj" />
          <Input label="Cidade" name="city" />
          <Input label="UF" name="uf" maxLength={2} />
          <Input label="Endereço" name="address" className="sm:col-span-2" />
          <Select label="Categoria" name="category_slug">
            <option value="">—</option>
            {(categories ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Input label="Ticket estimado (R$)" name="estimated_value_cents" type="number" step="0.01" />
          <Input label="Próxima ação (data/hora)" name="next_action_at" type="datetime-local" />
          <Input label="Descrição da ação" name="next_action_label" placeholder="ex: Ligar pra agendar visita" />
          <Textarea label="Notas" name="notes" className="sm:col-span-2" rows={3} />
        </div>

        <div className="flex justify-end gap-2 border-t border-brava-border pt-4">
          <a href="/comercial/crm" className="rounded-lg border border-brava-border px-4 py-2 text-sm font-bold text-brava-muted">Cancelar</a>
          <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
            Adicionar ao CRM
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, className = "", ...props }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <input {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
    </label>
  );
}
function Select({ label, children, className = "", ...props }: { label: string; children: React.ReactNode; className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <select {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm">{children}</select>
    </label>
  );
}
function Textarea({ label, className = "", ...props }: { label: string; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-brava-muted">{label}</span>
      <textarea {...props} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
    </label>
  );
}
