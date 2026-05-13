"use client";

import { useState } from "react";

interface Props {
  estabName: string;
  couponCode: string;
  discountLabel: string;
}

export function ShareCouponButton({ estabName, couponCode, discountLabel }: Props) {
  const [busy, setBusy] = useState(false);

  async function fire() {
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // bg gradient amarelo
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, "#FFD400");
    g.addColorStop(1, "#FF8A1E");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1920);

    // BRAVA+ wordmark
    ctx.fillStyle = "#1B1B1F";
    ctx.font = "900 96px system-ui";
    ctx.fillText("BRAVA+", 80, 200);

    // selo de cupom
    ctx.fillStyle = "#0B6BFF";
    ctx.font = "700 36px system-ui";
    ctx.fillText("CUPOM DE DESCONTO", 80, 320);

    // discount HUGE
    ctx.fillStyle = "#1B1B1F";
    ctx.font = "900 280px system-ui";
    ctx.fillText(discountLabel, 80, 700);

    ctx.font = "700 64px system-ui";
    ctx.fillText("na " + estabName, 80, 820);

    // código
    ctx.fillStyle = "#1B1B1F";
    ctx.fillRect(80, 1500, 920, 220);
    ctx.fillStyle = "#FFD400";
    ctx.font = "900 120px ui-monospace, Menlo, Monaco, monospace";
    ctx.textAlign = "center";
    ctx.fillText(couponCode, 540, 1640);
    ctx.textAlign = "left";

    ctx.fillStyle = "#1B1B1F";
    ctx.font = "400 32px system-ui";
    ctx.fillText("bravamais.app · clube de vantagens", 80, 1820);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setBusy(false);
        return;
      }
      const file = new File([blob], `cupom-${couponCode}.png`, { type: "image/png" });
      try {
        const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
        if (nav.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Cupom BRAVA+" });
        } else {
          // fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `cupom-${couponCode}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch {
        /* user cancelled */
      } finally {
        setBusy(false);
      }
    }, "image/png");
  }

  return (
    <button
      type="button"
      onClick={fire}
      disabled={busy}
      className="rounded-full border border-brava-border bg-brava-card px-3 py-1.5 text-[11px] font-bold text-brava-ink hover:bg-brava-paper disabled:opacity-60"
    >
      {busy ? "Gerando..." : "📤 Compartilhar"}
    </button>
  );
}
