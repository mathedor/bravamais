import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { CouponForm } from "./form";
import { deleteCouponAction, toggleCouponAction } from "./actions";

export const metadata = { title: "Cupons" };

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number | null;
  discount_cents: number | null;
  valid_until: string | null;
  uses_count: number;
  tier_required: string | null;
  is_active: boolean;
}

export default async function CuponsPage() {
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("id, code, description, discount_percent, discount_cents, valid_until, uses_count, tier_required, is_active")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Cupons</h1>
      <p className="mt-1 text-brava-muted">Crie códigos promocionais pros assinantes BRAVA+ usarem.</p>

      <section className="mt-8 rounded-3xl border border-brava-border bg-white p-6">
        <h2 className="text-lg font-bold text-brava-ink">Novo cupom</h2>
        <div className="mt-4">
          <CouponForm />
        </div>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-lg font-bold text-brava-ink">Cupons ({coupons?.length ?? 0})</h2>
        {(coupons as Coupon[] | null)?.length ? (
          (coupons as Coupon[]).map((c) => (
            <article
              key={c.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-brava-border bg-white p-4"
            >
              <span className="rounded-md bg-brava-yellow px-3 py-1 font-mono text-sm font-bold text-brava-black">
                {c.code}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-brava-ink">{c.description ?? "—"}</p>
                <p className="mt-0.5 text-xs text-brava-muted">
                  {c.uses_count} usos
                  {c.tier_required && ` · exclusivo ${c.tier_required.toUpperCase()}`}
                  {c.valid_until && ` · até ${new Date(c.valid_until).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <p className="text-lg font-black text-brava-blue">
                {c.discount_percent ? `${c.discount_percent}%` : c.discount_cents ? `-${formatBRL(c.discount_cents)}` : "—"}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${c.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
              >
                {c.is_active ? "ativo" : "pausado"}
              </span>
              <form action={toggleCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="is_active" value={String(c.is_active)} />
                <button className="text-sm text-brava-blue hover:underline">{c.is_active ? "pausar" : "ativar"}</button>
              </form>
              <form action={deleteCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-sm text-red-600 hover:underline">excluir</button>
              </form>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-brava-muted">
            Nenhum cupom criado.
          </p>
        )}
      </section>
    </div>
  );
}
