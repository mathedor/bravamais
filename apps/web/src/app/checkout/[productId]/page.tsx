import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import type { UserAddress } from "@/lib/supabase/types";
import { CheckoutForm } from "./checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, price_cents, photos, is_active, establishment_id, establishments(slug, name)")
    .eq("id", productId)
    .maybeSingle<{
      id: string;
      name: string;
      description: string | null;
      price_cents: number;
      photos: string[];
      is_active: boolean;
      establishment_id: string;
      establishments: { slug: string; name: string } | null;
    }>();

  if (!product || !product.is_active) notFound();

  const [{ data: addresses }, { data: settings }] = await Promise.all([
    supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", profile.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("establishment_delivery_settings")
      .select("delivery_enabled, pickup_enabled")
      .eq("establishment_id", product.establishment_id)
      .maybeSingle<{ delivery_enabled: boolean; pickup_enabled: boolean }>(),
  ]);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href={product.establishments ? `/app/estabelecimento/${product.establishments.slug}` : "/app"}
          className="grid h-9 w-9 place-items-center rounded-full border border-brava-border bg-brava-card text-lg"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-black text-brava-ink">Finalizar compra</h1>
          <p className="text-xs text-brava-muted">{formatBRL(product.price_cents)} · {product.name}</p>
        </div>
      </header>

      <CheckoutForm
        productId={product.id}
        productName={product.name}
        unitPriceCents={product.price_cents}
        establishmentId={product.establishment_id}
        establishmentName={product.establishments?.name ?? ""}
        pickupEnabled={settings?.pickup_enabled ?? true}
        deliveryEnabled={settings?.delivery_enabled ?? true}
        addresses={(addresses as UserAddress[] | null) ?? []}
      />
    </div>
  );
}
