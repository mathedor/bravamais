import { createClient } from "@/lib/supabase/server";
import { requireCommercial } from "@/lib/commercial-guard";
import { ProspectsMapClient } from "@/components/comercial/prospects-map";

export default async function ComercialProspectsPage() {
  const { affiliate } = await requireCommercial();
  const supabase = await createClient();

  const { data: prospects } = await supabase
    .from("commercial_prospects")
    .select("id, name, status, lat, lng, address, city, category_slug, phone, kind, source")
    .eq("affiliate_id", affiliate.id)
    .not("lat", "is", null)
    .not("lng", "is", null);

  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name, icon")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">prospecção em campo</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Mapa de prospects</h1>
        <p className="text-sm text-brava-muted">
          Busque um endereço e descubra estabelecimentos próximos (Google Places). Clique num pino pra adicionar ao seu CRM.
        </p>
      </header>

      <ProspectsMapClient
        affiliateId={affiliate.id}
        initialProspects={prospects ?? []}
        categories={categories ?? []}
        googleMapsKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
      />
    </div>
  );
}
