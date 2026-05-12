import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Meus presentes" };

interface GiftCard {
  id: string;
  code: string;
  value_cents: number;
  remaining_cents: number;
  status: string;
  recipient_name: string | null;
  recipient_message: string | null;
  created_at: string;
  redeemed_at: string | null;
  establishments: { slug: string; name: string; cover_url: string | null; logo_url: string | null } | null;
}

export default async function PresentesPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("gift_cards")
    .select(
      "id, code, value_cents, remaining_cents, status, recipient_name, recipient_message, created_at, redeemed_at, establishments(slug, name, cover_url, logo_url)",
    )
    .eq("buyer_user_id", profile.id)
    .order("created_at", { ascending: false });

  const list = (data as unknown as GiftCard[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Vale-presente</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Meus presentes</h1>
        <p className="mt-1 text-brava-muted">Vale-presentes que você comprou.</p>
      </header>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-10 text-center">
          <p className="text-brava-ink">Você ainda não comprou nenhum vale-presente.</p>
          <Link
            href="/app/buscar"
            className="mt-5 inline-flex items-center rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black"
          >
            Buscar parceiros
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((g) => (
            <Link
              key={g.id}
              href={`/presente/${g.code}`}
              className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-300 to-brava-yellow-deep p-5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">{g.establishments?.name ?? "—"}</p>
                  <p className="mt-2 text-3xl font-black text-brava-black">{formatBRL(g.value_cents)}</p>
                  <p className="mt-1 text-xs text-brava-black/70">
                    {g.recipient_name ? `Para ${g.recipient_name}` : "Sem destinatário"} ·{" "}
                    {new Date(g.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {g.establishments?.logo_url && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 ring-brava-black/10">
                    <Image src={g.establishments.logo_url} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-md bg-brava-black px-2 py-1 font-mono text-xs font-bold text-brava-yellow">
                  {g.code}
                </span>
                <span className="text-xs font-bold text-brava-blue">
                  {g.redeemed_at ? "✓ USADO" : "Toque pra ver"}
                </span>
              </div>
              <div className="pointer-events-none absolute -right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
              <div className="pointer-events-none absolute -left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-brava-card" />
            </Link>
          ))}
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
