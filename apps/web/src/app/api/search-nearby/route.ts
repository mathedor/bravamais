import { NextRequest, NextResponse } from "next/server";
import { searchEstablishments } from "@/lib/postgis-search";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const q = url.searchParams.get("q") || undefined;
  const categoria = url.searchParams.get("categoria") || undefined;
  const tipo = url.searchParams.get("tipo") || undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") || 24), 50);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const results = await searchEstablishments({
    q,
    categorySlugs: categoria ? [categoria] : undefined,
    promoTypes: tipo ? [tipo] : undefined,
    lat,
    lng,
    sortBy: "nearest",
    limit,
  });

  return NextResponse.json({ results });
}
