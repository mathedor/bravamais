import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { AmbassadorToggle } from "./ambassador-toggle";
import { PersonalCouponForm } from "./personal-coupon-form";

export const metadata = { title: "Clientes — Loja" };

interface TopCustomer {
  user_id: string;
  full_name: string | null;
  city: string | null;
  state: string | null;
  visits: number;
  orders: number;
  last_visit: string | null;
  total_spent_cents: number;
  is_ambassador: boolean;
}

export default async function ClientesPage() {
  const { establishment } = await requireEstablishment();
  const admin = createAdminClient();

  const { data } = await admin.rpc("estab_top_customers", { p_estab_id: establishment.id, p_limit: 50 });
  const rows = (data as TopCustomer[] | null) ?? [];

  const totalClients = rows.length;
  const ambassadors = rows.filter((r) => r.is_ambassador).length;
  const totalSpent = rows.reduce((s, r) => s + (r.total_spent_cents ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Clientes</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Quem mais visita você</h1>
          <p className="mt-1 text-sm text-brava-muted">
            {totalClients} clientes ativos · {ambassadors} embaixadores · {formatBRL(totalSpent)} gerados
          </p>
        </div>
        <Link href="/loja/blast" className="rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white">
          ⚡ Disparar promo flash
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-12 text-center">
          <p className="text-5xl">👥</p>
          <p className="mt-3 font-bold text-brava-ink">Nenhum cliente registrado</p>
          <p className="mt-1 text-sm text-brava-muted">Leia o QR de um assinante para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <article key={r.user_id} className="rounded-3xl border border-brava-border bg-brava-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brava-paper font-black text-brava-blue">#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-brava-ink">
                      <Link href={`/admin/usuarios/${r.user_id}`} className="hover:underline">
                        {r.full_name ?? "Cliente"}
                      </Link>
                      {r.is_ambassador && (
                        <span className="ml-2 rounded-full bg-brava-yellow px-2 py-0.5 text-[10px] font-black text-brava-black">
                          ⭐ EMBAIXADOR
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-brava-muted">
                      {r.city ? `${r.city}/${r.state ?? ""}` : "—"}
                      {r.last_visit && ` · Última visita ${timeAgo(r.last_visit)}`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <span className="rounded-lg bg-brava-paper px-2 py-1 font-bold text-brava-blue">{r.visits} visitas</span>
                  <span className="rounded-lg bg-brava-paper px-2 py-1 font-bold text-brava-ink">{formatBRL(r.total_spent_cents ?? 0)}</span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <AmbassadorToggle
                  userId={r.user_id}
                  estabId={establishment.id}
                  isAmbassador={r.is_ambassador}
                />
                <PersonalCouponForm
                  userId={r.user_id}
                  userName={r.full_name ?? "cliente"}
                  estabId={establishment.id}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d === 0) return "hoje";
  if (d === 1) return "ontem";
  if (d < 30) return `${d} dias atrás`;
  if (d < 365) return `${Math.floor(d / 30)} meses atrás`;
  return `${Math.floor(d / 365)} anos atrás`;
}
