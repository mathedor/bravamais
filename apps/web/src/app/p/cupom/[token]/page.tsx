import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { claimSharedCouponAction } from "./actions";

export const metadata = { title: "Cupom compartilhado" };

interface Share {
  id: string;
  sender_user_id: string;
  redeemed_by_user_id: string | null;
  redeemed_at: string | null;
  expires_at: string;
  coupons: {
    id: string;
    code: string;
    description: string | null;
    discount_percent: number | null;
    discount_cents: number | null;
    establishments: { slug: string; name: string; cover_url: string | null } | null;
  } | null;
  sender: { full_name: string | null } | null;
}

export default async function SharedCouponPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("shared_coupons")
    .select(
      "id, sender_user_id, redeemed_by_user_id, redeemed_at, expires_at, coupons(id, code, description, discount_percent, discount_cents, establishments(slug, name, cover_url)), sender:profiles!shared_coupons_sender_user_id_fkey(full_name)",
    )
    .eq("share_token", token)
    .maybeSingle();

  const share = data as unknown as Share | null;
  if (!share || !share.coupons || !share.coupons.establishments) notFound();

  const expired = new Date(share.expires_at) < new Date();
  const alreadyUsed = !!share.redeemed_at;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLogged = !!user;
  const isMyShare = user?.id === share.sender_user_id;

  const discount = share.coupons.discount_percent ? `-${share.coupons.discount_percent}%` : share.coupons.discount_cents ? `R$ ${(share.coupons.discount_cents / 100).toFixed(2)}` : "";
  const senderName = share.sender?.full_name?.split(" ")[0] ?? "Alguém";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brava-yellow via-amber-400 to-brava-yellow-deep p-6 text-brava-black shadow-2xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brava-black/15 blur-3xl" />

        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">{senderName} te mandou um cupom</p>
        <p className="mt-3 text-5xl font-black tracking-tight">{discount}</p>
        <p className="mt-1 text-base font-bold">na {share.coupons.establishments.name}</p>
        {share.coupons.description && <p className="mt-2 text-xs">{share.coupons.description}</p>}

        <div className="mt-5 inline-block rounded-md bg-brava-black px-3 py-2 font-mono text-base font-bold text-brava-yellow">
          {share.coupons.code}
        </div>
      </div>

      {expired ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
          Esse compartilhamento expirou. Peça outro pro {senderName}.
        </p>
      ) : alreadyUsed ? (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Esse cupom já foi pego por alguém. Bora caçar outro!
        </p>
      ) : isMyShare ? (
        <p className="mt-4 rounded-2xl bg-brava-card border border-brava-border px-4 py-3 text-center text-sm text-brava-muted">
          Você é quem enviou esse cupom. Compartilha o link com um amigo!
        </p>
      ) : isLogged ? (
        <form action={claimSharedCouponAction} className="mt-4">
          <input type="hidden" name="token" value={token} />
          <button type="submit" className="w-full rounded-full bg-brava-blue px-5 py-3.5 text-sm font-black text-white">
            🎁 Quero esse cupom
          </button>
        </form>
      ) : (
        <Link href={`/entrar?next=/p/cupom/${token}`} className="mt-4 block rounded-full bg-brava-blue px-5 py-3.5 text-center text-sm font-black text-white">
          Entrar pra usar esse cupom →
        </Link>
      )}

      <Link href={`/p/${share.coupons.establishments.slug}`} className="mt-3 block text-center text-xs text-brava-blue hover:underline">
        Ver loja: {share.coupons.establishments.name} →
      </Link>
    </div>
  );
}
