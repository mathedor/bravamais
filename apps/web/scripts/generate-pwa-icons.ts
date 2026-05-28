/**
 * Gera os PNGs do PWA por role (192 e 512) com a marca BRAVA+ centralizada.
 * Saída: apps/web/public/icons/{role}-{size}.png
 *
 * Uso: pnpm exec tsx scripts/generate-pwa-icons.ts
 */
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "icons");

interface RoleSpec {
  role: "subscriber" | "establishment" | "admin" | "comercial" | "deliverer";
  /** Cor de fundo (canvas todo) */
  bg: string;
  /** Cor de fundo da "moldura" arredondada por cima (efeito maskable safe area) */
  inner: string;
  /** Cor do "+" gigante */
  plus: string;
  /** Cor da "BRAVA" embaixo do + */
  text: string;
  /** Pequeno chip da role (canto) */
  chip: { fill: string; text: string; label: string };
}

const ROLES: RoleSpec[] = [
  {
    role: "subscriber",
    bg: "#0A0A0A",
    inner: "#FBBF24",
    plus: "#0A0A0A",
    text: "#0A0A0A",
    chip: { fill: "#1E3A8A", text: "#FFFFFF", label: "CLUB" },
  },
  {
    role: "establishment",
    bg: "#0A0A0A",
    inner: "#1E3A8A",
    plus: "#FBBF24",
    text: "#FFFFFF",
    chip: { fill: "#FBBF24", text: "#0A0A0A", label: "LOJA" },
  },
  {
    role: "admin",
    bg: "#FBBF24",
    inner: "#0A0A0A",
    plus: "#FBBF24",
    text: "#FBBF24",
    chip: { fill: "#FBBF24", text: "#0A0A0A", label: "ADM" },
  },
  {
    role: "comercial",
    bg: "#0A0A0A",
    inner: "#16A34A",
    plus: "#FBBF24",
    text: "#FFFFFF",
    chip: { fill: "#FBBF24", text: "#0A0A0A", label: "FIELD" },
  },
  {
    role: "deliverer",
    bg: "#0A0A0A",
    inner: "#EA580C",
    plus: "#FBBF24",
    text: "#FFFFFF",
    chip: { fill: "#FBBF24", text: "#0A0A0A", label: "MOTO" },
  },
];

function buildSvg(spec: RoleSpec, size: number): string {
  const safeRadius = Math.round(size * 0.22); // canto arredondado tipo maskable
  const innerPad = Math.round(size * 0.08); // safe area pro maskable (8% das bordas)
  const innerSize = size - innerPad * 2;
  const plusSize = Math.round(size * 0.55);
  const plusX = size / 2;
  const plusY = size * 0.42;
  const strokeW = Math.round(size * 0.085);
  const textY = size * 0.82;
  const textSize = Math.round(size * 0.14);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${spec.inner}" stop-opacity="1" />
      <stop offset="100%" stop-color="${spec.inner}" stop-opacity="0.85" />
    </linearGradient>
  </defs>

  <!-- canvas de fundo (cobre 100% pra maskable) -->
  <rect width="${size}" height="${size}" fill="${spec.bg}" />

  <!-- moldura interna arredondada -->
  <rect
    x="${innerPad}" y="${innerPad}"
    width="${innerSize}" height="${innerSize}"
    rx="${safeRadius}" ry="${safeRadius}"
    fill="url(#innerGrad)"
  />

  <!-- "+" gigante centralizado -->
  <g stroke="${spec.plus}" stroke-width="${strokeW}" stroke-linecap="round">
    <line x1="${plusX - plusSize / 2}" y1="${plusY}" x2="${plusX + plusSize / 2}" y2="${plusY}" />
    <line x1="${plusX}" y1="${plusY - plusSize / 2}" x2="${plusX}" y2="${plusY + plusSize / 2}" />
  </g>

  <!-- "BRAVA" -->
  <text
    x="${size / 2}" y="${textY}"
    font-family="system-ui, -apple-system, 'Segoe UI', sans-serif"
    font-size="${textSize}" font-weight="900"
    fill="${spec.text}"
    text-anchor="middle"
    letter-spacing="${Math.round(size * 0.01)}"
  >BRAVA</text>

  <!-- chip da role (canto inferior direito) -->
  <g transform="translate(${size * 0.62}, ${size * 0.04})">
    <rect
      x="0" y="0"
      width="${Math.round(size * 0.34)}" height="${Math.round(size * 0.1)}"
      rx="${Math.round(size * 0.05)}"
      fill="${spec.chip.fill}"
    />
    <text
      x="${Math.round(size * 0.17)}" y="${Math.round(size * 0.075)}"
      font-family="system-ui, sans-serif"
      font-size="${Math.round(size * 0.055)}" font-weight="900"
      fill="${spec.chip.text}"
      text-anchor="middle"
      letter-spacing="${Math.round(size * 0.005)}"
    >${spec.chip.label}</text>
  </g>
</svg>`;
}

async function main(): Promise<void> {
  await mkdir(OUT_DIR, { recursive: true });
  const sizes = [192, 512];

  for (const spec of ROLES) {
    for (const size of sizes) {
      const svg = buildSvg(spec, size);
      const buf = Buffer.from(svg);
      const out = join(OUT_DIR, `${spec.role}-${size}.png`);
      await sharp(buf, { density: 300 })
        .resize(size, size, { fit: "contain" })
        .png({ compressionLevel: 9 })
        .toFile(out);
      console.log("✓", `${spec.role}-${size}.png`);
    }
  }

  // bonus: também gera /icons/maskable.svg (renderiza versão "subscriber" como fallback)
  const svg = buildSvg(ROLES[0], 512);
  await writeFile(join(OUT_DIR, "maskable.svg"), svg);
  console.log("✓ maskable.svg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
