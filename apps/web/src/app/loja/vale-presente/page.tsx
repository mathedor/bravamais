import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/establishment-guard";
import { formatBRL } from "@/lib/format";
import { redeemGiftCardAction } from "./actions";

export const metadata = { title: "Vale-presente — Loja" };

interface GiftCard {
  id: string;
  code: string;
  value_cents: number;
  remaining_cents: number;
  status: string;
  buyer_user_id: string | null;
  recipient_name: string | null;
  recipient_message: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export default async function ValePresenteLoja({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { establishment } = await requireEstablishment();
  const { filter } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("gift_cards")
    .select("id, code, value_cents, remaining_cents, status, buyer_user_id, recipient_name, recipient_message, redeemed_at, created_at")
    .eq("establishment_id", establishment.id)
    .order("created_at", { ascending: false });

  if (filter === "pending") query = query.eq("status", "paid").is("redeemed_at", null);
  if (filter === "redeemed") query = query.not("redeemed_at", "is", null);

  const { data } = await query;
  const list = (data as GiftCard[] | null) ?? [];

  const totalPaid = list.reduce((s, g) => (g.status === "paid" || g.status === "redeemed" ? s + g.value_cents : s), 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Vale-presente</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Comprados pelos clientes</h1>
        <p className="mt-1 text-brava-muted">Valida o código quando o cliente apresentar.</p>
      </header>

      <section className="mb-6 grid grid-cols-3 gap-3">
        <Kpi label="Total" value={`${list.length}`} />
        <Kpi label="Pendentes" value={`${list.filter((g) => g.status === "paid" && !g.redeemed_at).length}`} />
        <Kpi label="Faturado" value={formatBRL(totalPaid)} />
      </section>

      <section className="mb-6 rounded-3xl border border-brava-yellow bg-brava-yellow/10 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brava-blue">Validar agora</h2>
        <p className="mt-1 text-xs text-brava-muted">Cliente mostra o código, você confirma.</p>
        <form action={redeemGiftCardAction} className="mt-3 flex gap-2">
          <input
            name="code"
            placeholder="Cole o código aqui"
            className="flex-1 rounded-xl border border-brava-border bg-white px-4 py-2.5 uppercase outline-none focus:border-brava-yellow"
          />
          <button type="submit" className="rounded-xl bg-brava-black px-5 py-2.5 text-sm font-bold text-white">
            Validar
          </button>
        </form>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterLink href="/loja/vale-presente" active={!filter}>Todos</FilterLink>
        <FilterLink href="/loja/vale-presente?filter=pending" active={filter === "pending"}>Pendentes</FilterLink>
        <FilterLink href="/loja/vale-presente?filter=redeemed" active={filter === "redeemed"}>Usados</FilterLink>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-brava-border bg-white p-10 text-center text-sm text-brava-muted">
            Nenhum vale-presente {filter ? "neste filtro" : "ainda"}.
          </p>
        ) : (
          list.map((g) => (
            <article
              key={g.id}
              className={`rounded-3xl border bg-white p-5 transition ${g.redeemed_at ? "opacity-60" : "border-brava-border"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-brava-yellow px-3 py-1 font-mono text-xs font-bold tracking-wide text-brava-black">
                    {g.code}
                  </span>
                  <p className="mt-2 text-xs text-brava-muted">
                    Para: <strong className="text-brava-ink">{g.recipient_name ?? "—"}</strong>
                    {" · "}
                    {new Date(g.created_at).toLocaleDateString("pt-BR")}
                  </p>
                  {g.recipient_message && (
                    <p className="mt-2 max-w-md text-sm italic text-brava-muted">&quot;{g.recipient_message}&quot;</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-brava-blue">{formatBRL(g.value_cents)}</p>
                  <p className="mt-1 text-xs">
                    {g.redeemed_at ? (
                      <span className="rounded-full bg-zinc-200 px-2 py-0.5 font-bold text-zinc-600">USADO</span>
                    ) : g.status === "paid" ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 font-bold text-green-700">PAGO · PENDENTE</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700">{g.status.toUpperCase()}</span>
                    )}
                  </p>
                  {!g.redeemed_at && g.status === "paid" && (
                    <form action={redeemGiftCardAction} className="mt-2">
                      <input type="hidden" name="code" value={g.code} />
                      <button className="rounded-full bg-brava-black px-4 py-1.5 text-xs font-bold text-white">
                        Marcar como usado
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8">
        <Link href="/loja" className="text-sm text-brava-muted hover:text-brava-ink">← Voltar pra loja</Link>
      </div>

      <div className="h-6" />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-brava-border bg-white p-3">
      <p className="text-[10px] uppercase tracking-wider text-brava-muted">{label}</p>
      <p className="mt-1 text-xl font-black text-brava-ink">{value}</p>
    </article>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-brava-blue text-white" : "bg-white border border-brava-border text-brava-ink"}`}
    >
      {children}
    </Link>
  );
}
