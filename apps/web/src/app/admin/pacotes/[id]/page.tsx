import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { AddCouponForm } from "./add-form";
import { RemoveCouponBtn } from "./remove-btn";

export const metadata = { title: "Editar pacote — Admin" };

export default async function PackageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: pkg }, { data: itemsRaw }, { data: coupons }] = await Promise.all([
    admin.from("seasonal_packages").select("id, title, subtitle, theme_emoji").eq("id", id).maybeSingle(),
    admin
      .from("seasonal_package_coupons")
      .select("coupon_id, highlight, display_order, coupons(code, description, discount_percent, discount_cents, establishments(name, slug))")
      .eq("package_id", id)
      .order("display_order"),
    admin
      .from("coupons")
      .select("id, code, description, discount_percent, discount_cents, establishments(name)")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .limit(300),
  ]);

  if (!pkg) notFound();

  type Item = {
    coupon_id: string;
    highlight: boolean;
    coupons: { code: string; description: string | null; discount_percent: number | null; discount_cents: number | null; establishments: { name: string; slug: string } | null } | null;
  };
  type CouponOpt = {
    id: string;
    code: string;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { name: string } | null;
  };
  const items = (itemsRaw as unknown as Item[] | null) ?? [];
  const couponOptions = (coupons as unknown as CouponOpt[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-6">
        <Link href="/admin/pacotes" className="text-xs text-brava-blue hover:underline">← Pacotes</Link>
        <h1 className="mt-2 text-3xl font-black text-brava-ink">{pkg.theme_emoji} {pkg.title}</h1>
        {pkg.subtitle && <p className="mt-1 text-sm text-brava-muted">{pkg.subtitle}</p>}
      </header>

      <AddCouponForm packageId={id} coupons={couponOptions} />

      <section className="mt-8 space-y-2">
        <h2 className="text-lg font-black text-brava-ink">{items.length} cupom(s) no pacote</h2>
        {items.map((it) =>
          it.coupons ? (
            <article key={it.coupon_id} className={`flex items-center justify-between gap-2 rounded-2xl border p-3 ${it.highlight ? "border-brava-yellow bg-brava-yellow/10" : "border-brava-border bg-brava-card"}`}>
              <div>
                <p className="font-bold text-brava-ink">
                  {it.highlight && "⭐ "}
                  <code className="font-mono">{it.coupons.code}</code> · {it.coupons.establishments?.name ?? "—"}
                </p>
                <p className="text-[11px] text-brava-muted">
                  {it.coupons.discount_percent ? `-${it.coupons.discount_percent}%` : it.coupons.discount_cents ? `R$ ${(it.coupons.discount_cents / 100).toFixed(2)}` : ""}
                  {it.coupons.description && ` · ${it.coupons.description}`}
                </p>
              </div>
              <RemoveCouponBtn packageId={id} couponId={it.coupon_id} />
            </article>
          ) : null,
        )}
      </section>
    </div>
  );
}
