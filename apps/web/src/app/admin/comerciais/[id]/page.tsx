import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import {
  updateCommercialAction,
  activateCommercialAction,
  deactivateCommercialAction,
} from "@/app/admin/comerciais/actions";

// Adapter pra signature do form (FormData → void)
async function updateCommercialFormAction(fd: FormData) {
  "use server";
  await updateCommercialAction(undefined, fd);
}

function brl(cents: number | null | undefined) {
  return `R$ ${((cents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export default async function ComercialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: c } = await supabase
    .from("commercial_affiliates")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!c) notFound();

  const { data: kpis } = await supabase.rpc("commercial_dashboard", { p_affiliate_id: id });
  const k = kpis?.[0] ?? null;

  const { data: estabs } = await supabase
    .from("affiliate_referrals")
    .select("id, signed_at, establishment:establishment_id(name, city, slug)")
    .eq("affiliate_id", id)
    .order("signed_at", { ascending: false })
    .limit(20);

  const { data: subs } = await supabase
    .from("subscriber_referrals")
    .select("id, signed_at, profile:user_id(full_name, email)")
    .eq("affiliate_id", id)
    .order("signed_at", { ascending: false })
    .limit(20);

  const pctValue = (v: number) => (v * 100).toFixed(1);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/comerciais" className="text-xs text-brava-blue hover:underline">← voltar</Link>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{c.name}</h1>
          <p className="text-sm text-brava-muted">
            Código <span className="font-mono font-bold">{c.code}</span> · {c.email}
          </p>
        </div>
        {c.is_active ? (
          <form action={deactivateCommercialAction.bind(null, id)}>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100">Desativar</button>
          </form>
        ) : (
          <form action={activateCommercialAction.bind(null, id)}>
            <button className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700">Reativar</button>
          </form>
        )}
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Estabs ativos" value={String(k?.estabs_ativos ?? 0)} tone="yellow" />
        <Kpi label="Subs ativos" value={String(k?.subs_ativos ?? 0)} tone="blue" />
        <Kpi label="Comissão mês (estab)" value={brl(k?.commission_estab_month_cents)} />
        <Kpi label="Comissão mês (sub)" value={brl(k?.commission_sub_month_cents)} />
      </section>

      <form action={updateCommercialFormAction} className="space-y-6 rounded-2xl border border-brava-border bg-brava-card p-5">
        <input type="hidden" name="id" value={id} />

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Dados</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nome" name="name" defaultValue={c.name} />
            <Input label="Telefone" name="phone" defaultValue={c.phone ?? ""} />
            <Input label="Território" name="territory" defaultValue={c.territory ?? ""} />
            <Input label="Chave PIX" name="pix_key" defaultValue={c.pix_key ?? ""} />
          </div>
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={c.is_active} /> Ativo
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão por estabelecimento</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="Tipo" name="establishment_commission_kind" defaultValue={c.establishment_commission_kind}>
              <option value="percent">Percentual</option>
              <option value="fixed">Valor fixo</option>
            </Select>
            <Input
              label="Valor"
              name="establishment_commission_value"
              defaultValue={c.establishment_commission_kind === "percent" ? pctValue(c.establishment_commission_value) : c.establishment_commission_value.toFixed(2)}
            />
            <Input label="Meses" name="establishment_commission_months" type="number" defaultValue={String(c.establishment_commission_months)} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Comissão por assinante (por tier)</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <Select label="Tipo" name="subscriber_commission_kind" defaultValue={c.subscriber_commission_kind}>
              <option value="percent">Percentual</option>
              <option value="fixed">Valor fixo</option>
            </Select>
            <Input label="Básico" name="subscriber_commission_basic_value"
              defaultValue={c.subscriber_commission_kind === "percent" ? pctValue(c.subscriber_commission_basic_value) : c.subscriber_commission_basic_value.toFixed(2)} />
            <Input label="Premium" name="subscriber_commission_premium_value"
              defaultValue={c.subscriber_commission_kind === "percent" ? pctValue(c.subscriber_commission_premium_value) : c.subscriber_commission_premium_value.toFixed(2)} />
            <Input label="VIP" name="subscriber_commission_vip_value"
              defaultValue={c.subscriber_commission_kind === "percent" ? pctValue(c.subscriber_commission_vip_value) : c.subscriber_commission_vip_value.toFixed(2)} />
          </div>
          <div className="mt-3">
            <Input label="Meses" name="subscriber_commission_months" type="number" defaultValue={String(c.subscriber_commission_months)} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-brava-muted">Notas internas</h2>
          <textarea name="notes" rows={3} defaultValue={c.notes ?? ""} className="w-full rounded-lg border border-brava-border bg-brava-paper px-3 py-2 text-sm" />
        </section>

        <div className="flex justify-end gap-2 border-t border-brava-border pt-4">
          <button type="submit" className="rounded-lg bg-brava-blue px-5 py-2 text-sm font-black text-white hover:bg-brava-blue-bright">
            Salvar alterações
          </button>
        </div>
      </form>

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Estabelecimentos vinculados ({estabs?.length ?? 0})</h2>
          {estabs && estabs.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
              {estabs.map((e: any) => (
                <li key={e.id} className="px-4 py-2 text-sm">
                  <div className="font-bold">{e.establishment?.name ?? "—"}</div>
                  <div className="text-xs text-brava-muted">{e.establishment?.city} · {new Date(e.signed_at).toLocaleDateString("pt-BR")}</div>
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </div>
        <div>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Assinantes vinculados ({subs?.length ?? 0})</h2>
          {subs && subs.length > 0 ? (
            <ul className="divide-y divide-brava-border rounded-2xl border border-brava-border bg-brava-card">
              {subs.map((s: any) => (
                <li key={s.id} className="px-4 py-2 text-sm">
                  <div className="font-bold">{s.profile?.full_name ?? "—"}</div>
                  <div className="text-xs text-brava-muted">{s.profile?.email} · {new Date(s.signed_at).toLocaleDateString("pt-BR")}</div>
                </li>
              ))}
            </ul>
          ) : <Empty />}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "yellow" | "blue" }) {
  const cls = tone === "yellow" ? "border-brava-yellow/40 bg-brava-yellow/5"
    : tone === "blue" ? "border-brava-blue/30 bg-brava-blue/5"
    : "border-brava-border bg-brava-card";
  return (
    <div className={`rounded-2xl border ${cls} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-brava-muted">{label}</div>
      <div className="mt-1 text-xl font-black sm:text-2xl">{value}</div>
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
function Empty() { return <div className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-6 text-center text-xs text-brava-muted">Nada ainda.</div>; }
