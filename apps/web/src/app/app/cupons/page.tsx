import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Meus cupons usados" };

interface Row {
  id: string;
  redeemed_at: string;
  coupons: {
    id: string;
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; logo_url: string | null } | null;
  } | null;
}

export default async function MeusCuponsPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("coupon_redemptions")
    .select(
      "id, redeemed_at, coupons(id, code, description, discount_percent, discount_cents, establishments(slug, name, logo_url))",
    )
    .eq("user_id", profile.id)
    .order("redeemed_at", { ascending: false });

  const rows = (data as unknown as Row[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Cupons usados</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meu histórico de cupons</h1>
        <p className="mt-1 text-brava-muted">{rows.length} {rows.length === 1 ? "cupom utilizado" : "cupons utilizados"}</p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-brava-ink">Você ainda não usou nenhum cupom.</p>
          <p className="mt-1 text-sm text-brava-muted">Abra um parceiro e clique em &quot;Usar cupom&quot;.</p>
          <Link href="/app/buscar" className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black">
            Buscar parceiros
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const c = r.coupons;
            if (!c) return null;
            const valor = c.discount_percent ? `${c.discount_percent}%` : c.discount_cents ? `-${formatBRL(c.discount_cents)}` : "—";
            return (
              <li key={r.id}>
                <Link
                  href={c.establishments ? `/app/estabelecimento/${c.establishments.slug}` : "#"}
                  className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                        {c.establishments?.name ?? "—"}
                      </p>
                      <p className="mt-2 text-3xl font-black text-brava-black">{valor}</p>
                      {c.description && <p className="mt-1 text-xs text-brava-black/80">{c.description}</p>}
                    </div>
                    {c.establishments?.logo_url && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-brava-black/10">
                        <Image src={c.establishments.logo_url} alt="" fill sizes="56px" className="object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-md bg-brava-black px-2 py-1 font-mono text-xs font-bold text-brava-yellow">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-brava-blue">
                      usado em {new Date(r.redeemed_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="pointer-events-none absolute -right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
                  <div className="pointer-events-none absolute -left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
