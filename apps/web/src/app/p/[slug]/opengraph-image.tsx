import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: { slug: string } }) {
  const admin = createAdminClient();
  const { data: estab } = await admin
    .from("establishments")
    .select("name, tagline, cover_url, average_rating, city, state")
    .eq("slug", params.slug)
    .maybeSingle();

  const name = estab?.name ?? "BRAVA+";
  const tagline = estab?.tagline ?? "Clube de vantagens";
  const rating = estab?.average_rating ? `⭐ ${Number(estab.average_rating).toFixed(1)}` : "";
  const cityState = estab?.city ? `${estab.city}/${estab.state ?? ""}` : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0A0A0A 0%, #0B6BFF 100%)",
          color: "#fff",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1 }}>
          BRAVA<span style={{ color: "#FFD400" }}>+</span>
        </div>
        <div>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.0, marginBottom: 16, maxWidth: 1000 }}>
            {name}
          </div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.75)", maxWidth: 900 }}>
            {tagline}
          </div>
          <div style={{ marginTop: 32, fontSize: 24, color: "#FFD400", display: "flex", gap: 24 }}>
            {rating && <span>{rating}</span>}
            {cityState && <span>📍 {cityState}</span>}
          </div>
        </div>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.5)" }}>
          Cupons, fidelidade e cashback · bravamais.app
        </div>
      </div>
    ),
    { ...size },
  );
}
