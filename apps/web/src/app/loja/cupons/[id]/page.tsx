import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Cupom — Quem usou" };

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Redemption {
  id: string;
  redeemed_at: string;
  profiles: { id: string; full_name: string | null; city: string | null; state: string | null } | null;
}

export default async function CouponDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { establishment } = await requireEstablishment();
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("id, code, description, discount_percent, discount_cents, uses_count, max_uses, valid_until, is_active, tier_required, establishment_id")
    .eq("id", id)
    .maybeSingle();
  if (!coupon || coupon.establishment_id !== establishment.id) notFound();

  const { data: redemptions } = await supabase
    .from("coupon_redemptions")
    .select("id, redeemed_at, profiles(id, full_name, city, state)")
    .eq("coupon_id", id)
    .order("redeemed_at", { ascending: false });

  const list = (redemptions as unknown as Redemption[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Link href="/loja/cupons" className="text-xs text-brava-muted">← Voltar pros cupons</Link>

      <header className="mt-3 rounded-3xl border border-brava-border bg-brava-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="rounded-md bg-brava-yellow px-3 py-1 font-mono text-sm font-bold text-brava-black">
              {coupon.code}
            </span>
            <p className="mt-3 text-sm text-brava-muted">{coupon.description ?? "—"}</p>
          </div>
          <p className="text-4xl font-black text-brava-blue">
            {coupon.discount_percent ? `${coupon.discount_percent}%` : coupon.discount_cents ? `-${formatBRL(coupon.discount_cents)}` : "—"}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Stat label="Usos" value={`${coupon.uses_count}`} />
          <Stat label="Limite" value={coupon.max_uses ? `${coupon.max_uses}` : "ilimitado"} />
          <Stat label="Tier exclusivo" value={coupon.tier_required?.toUpperCase() ?? "todos"} />
          <Stat label="Status" value={coupon.is_active ? "ativo" : "pausado"} />
        </div>
      </header>

      <h2 className="mt-8 text-lg font-bold text-brava-ink">Clientes que usaram ({list.length})</h2>
      <p className="mt-1 text-sm text-brava-muted">Cada vez que um assinante clica em &quot;Usar cupom&quot;, fica registrado aqui.</p>

      <div className="mt-4 overflow-hidden rounded-3xl border border-brava-border bg-brava-card">
        <table className="w-full text-sm table-cards">
          <thead className="bg-brava-paper text-xs uppercase tracking-wider text-brava-muted">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Cidade</th>
              <th className="px-4 py-3 text-right">Quando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brava-border">
            {list.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-brava-muted">Nenhum cliente usou ainda.</td></tr>
            ) : list.map((r) => (
              <tr key={r.id} className="hover:bg-brava-paper">
                <td className="px-4 py-3 font-medium text-brava-ink">{r.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-brava-muted">{r.profiles?.city ? `${r.profiles.city}/${r.profiles.state ?? ""}` : "—"}</td>
                <td className="px-4 py-3 text-right text-xs text-brava-muted">{new Date(r.redeemed_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-0.5 font-bold text-brava-ink">{value}</p>
    </div>
  );
}
