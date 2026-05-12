import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { NewCouponForm, NewProductForm, LoyaltyForm } from "./forms";
import {
  adminDeleteCouponAction,
  adminToggleCouponAction,
  adminDeleteProductAction,
} from "./actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Operação — Admin" };

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_percent: number | null;
  discount_cents: number | null;
  uses_count: number;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  price_cents: number;
  is_active: boolean;
}

interface Club {
  id: string;
  name: string;
  benefit_description: string;
  visits_required: number;
}

export default async function OperacaoPage({ params }: PageProps) {
  await requireRole("admin");
  const { slug } = await params;
  const supabase = await createClient();

  const { data: estab } = await supabase.from("establishments").select("id, name, slug").eq("slug", slug).maybeSingle();
  if (!estab) notFound();

  const [{ data: coupons }, { data: products }, { data: club }] = await Promise.all([
    supabase.from("coupons").select("id, code, description, discount_percent, discount_cents, uses_count, is_active")
      .eq("establishment_id", estab.id).order("created_at", { ascending: false }),
    supabase.from("products").select("id, name, price_cents, is_active")
      .eq("establishment_id", estab.id).order("created_at", { ascending: false }),
    supabase.from("loyalty_clubs").select("id, name, benefit_description, visits_required")
      .eq("establishment_id", estab.id).maybeSingle(),
  ]);

  const couponsList = (coupons as Coupon[] | null) ?? [];
  const productsList = (products as Product[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link href={`/admin/estabelecimentos/${slug}`} className="text-xs text-brava-muted">← Voltar pro 360</Link>
      <h1 className="mt-3 text-3xl font-black tracking-tight">Operação: {estab.name}</h1>
      <p className="mt-1 rounded-xl bg-amber-50 px-4 py-2 text-xs text-amber-900">
        ⚠️ Admin pode editar tudo aqui <strong>menos stories</strong>. Stories são exclusivos do dono pelo /loja/hoje.
      </p>

      {/* CUPONS */}
      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-lg font-bold">🎟️ Cupons</h2>
        <div className="mt-4">
          <NewCouponForm estabId={estab.id} slug={slug} />
        </div>
        <div className="mt-5 space-y-2">
          {couponsList.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem cupons.</p>
          ) : couponsList.map((c) => (
            <article key={c.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-brava-paper p-3">
              <span className="rounded-md bg-brava-yellow px-2 py-0.5 font-mono text-xs font-bold">{c.code}</span>
              <span className="line-clamp-1 flex-1 text-sm text-brava-muted">{c.description ?? "—"}</span>
              <span className="text-sm font-bold text-brava-blue">
                {c.discount_percent ? `${c.discount_percent}%` : c.discount_cents ? `-${formatBRL(c.discount_cents)}` : "—"}
              </span>
              <span className="rounded-full bg-brava-card px-2 py-0.5 text-[10px]">{c.uses_count} usos</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {c.is_active ? "ativo" : "pausado"}
              </span>
              <form action={adminToggleCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="is_active" value={String(c.is_active)} />
                <input type="hidden" name="slug" value={slug} />
                <button className="text-xs text-brava-blue hover:underline">{c.is_active ? "pausar" : "ativar"}</button>
              </form>
              <form action={adminDeleteCouponAction}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="estab_id" value={estab.id} />
                <button className="text-xs text-red-600 hover:underline">excluir</button>
              </form>
            </article>
          ))}
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-lg font-bold">📦 Catálogo</h2>
        <div className="mt-4">
          <NewProductForm estabId={estab.id} slug={slug} />
        </div>
        <div className="mt-5 space-y-2">
          {productsList.length === 0 ? (
            <p className="text-sm text-brava-muted">Sem produtos.</p>
          ) : productsList.map((p) => (
            <article key={p.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-brava-paper p-3">
              <span className="line-clamp-1 flex-1 font-medium">{p.name}</span>
              <span className="text-sm font-bold text-brava-blue">{formatBRL(p.price_cents)}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.is_active ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {p.is_active ? "ativo" : "pausado"}
              </span>
              <form action={adminDeleteProductAction}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="slug" value={slug} />
                <button className="text-xs text-red-600 hover:underline">excluir</button>
              </form>
            </article>
          ))}
        </div>
      </section>

      {/* FIDELIDADE */}
      <section className="mt-8 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-lg font-bold">⭐ Clube de fidelidade</h2>
        <div className="mt-4">
          <LoyaltyForm estabId={estab.id} slug={slug} club={(club as Club | null) ?? null} />
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}
