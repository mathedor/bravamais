import { NextResponse } from "next/server";

export const dynamic = "force-static";

// Manifest padrão (landing / login) — assim que o user entra no painel do role,
// o manifest específico do role (/app/manifest.webmanifest, /loja/..., etc) assume.
export function GET() {
  return NextResponse.json(
    {
      name: "BRAVA+ · Clube de vantagens",
      short_name: "BRAVA+",
      description:
        "Clube de vantagens BRAVA+. Cupons, fidelidade, vale-presente e benefícios em parceiros locais.",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait",
      background_color: "#0a0a0a",
      theme_color: "#0a0a0a",
      lang: "pt-BR",
      categories: ["lifestyle", "shopping"],
      icons: [
        { src: "/logo-mark.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
        { src: "/icons/subscriber-192.png", type: "image/png", sizes: "192x192", purpose: "any maskable" },
        { src: "/icons/subscriber-512.png", type: "image/png", sizes: "512x512", purpose: "any maskable" },
      ],
    },
    { headers: { "content-type": "application/manifest+json; charset=utf-8" } },
  );
}
