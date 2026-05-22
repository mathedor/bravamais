import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

/**
 * Arte automática do Benefício Renovável (1080x1080, formato story/feed).
 * Gradiente BRAVA+ + logo do estabelecimento + valor do benefício + validade.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  const admin = createAdminClient();

  const { data: grant } = await admin
    .from("renewable_benefit_grants")
    .select("kind, value, headline, code, expires_at, status, establishment:establishment_id(name, logo_url, city)")
    .eq("id", grantId)
    .maybeSingle();

  const estab = (grant?.establishment as any) ?? {};
  const name = estab.name ?? "BRAVA+";
  const logo = estab.logo_url ?? null;
  const headline = grant?.headline ?? "Benefício BRAVA+";
  const code = grant?.code ?? "------";
  const valido = grant?.expires_at
    ? new Date(grant.expires_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
    : "";

  const bigValue = grant
    ? grant.kind === "percent"
      ? `${Number(grant.value)}%`
      : `R$ ${(Number(grant.value) / 100).toFixed(0)}`
    : "★";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1080,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1E3A8A 55%, #2563EB 100%)",
          color: "#fff",
          fontFamily: "system-ui",
          padding: 80,
          position: "relative",
        }}
      >
        {/* "+" gigante de fundo */}
        <div style={{
          position: "absolute", right: -120, top: 120,
          fontSize: 900, fontWeight: 900, color: "rgba(251,191,36,0.10)", lineHeight: 1,
        }}>+</div>

        {/* topo: marca + logo do estab */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 48, fontWeight: 900 }}>
            BRAVA<span style={{ color: "#FBBF24" }}>+</span>
          </div>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={120} height={120} style={{ borderRadius: 24, border: "4px solid rgba(255,255,255,0.2)", objectFit: "cover" }} alt="" />
          ) : (
            <div style={{
              width: 120, height: 120, borderRadius: 24,
              background: "#FBBF24", color: "#0A0A0A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, fontWeight: 900,
            }}>{name[0]}</div>
          )}
        </div>

        {/* centro: valor gigante */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 60, flex: 1, justifyContent: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: 4 }}>
            Benefício Renovável
          </div>
          <div style={{ fontSize: 280, fontWeight: 900, lineHeight: 0.9, color: "#FBBF24", marginTop: 10 }}>
            {bigValue}
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, marginTop: 10 }}>{headline}</div>
          <div style={{ fontSize: 40, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>em {name}</div>
        </div>

        {/* rodapé: código + validade */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid rgba(255,255,255,0.15)", paddingTop: 40 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 2 }}>código</div>
            <div style={{ fontSize: 56, fontWeight: 900, fontFamily: "monospace", color: "#fff" }}>{code}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 2 }}>use até</div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>{valido}</div>
            <div style={{ fontSize: 22, color: "#FBBF24", marginTop: 4 }}>não acumula — depois renova</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
