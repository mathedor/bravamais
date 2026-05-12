"use client";

import { useId } from "react";
import { useTheme } from "./theme-provider";

interface Props {
  /** Tamanho de fonte do "brava" em pixels. O "+" cresce proporcional. */
  size?: number;
  /** Força variant — caso contrário, segue o tema atual */
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Logo BRAVA+ adaptativo:
 * - "brava" renderizado em HTML usando Fredoka (rounded/friendly) via next/font
 * - "+" inline SVG inclinado pra direita 15° com gradiente amarelo + contorno azul
 * - Cor da escrita troca com o tema (preto/branco)
 */
export function BravaLogo({ size = 36, variant, className }: Props) {
  const { resolved } = useTheme();
  const mode = variant ?? resolved;
  const isDark = mode === "dark";
  const gradId = useId();

  const plusSize = Math.round(size * 1.15);
  const textColor = isDark ? "#FFFFFF" : "#0A0A0A";

  return (
    <span
      className={`inline-flex items-center gap-3 ${className ?? ""}`}
      aria-label="brava+"
    >
      <span
        style={{
          fontFamily: "var(--font-fredoka), 'Nunito', 'Trebuchet MS', sans-serif",
          fontWeight: 600,
          fontSize: `${size}px`,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: textColor,
        }}
      >
        brava
      </span>
      <svg
        width={plusSize}
        height={plusSize}
        viewBox="0 0 280 280"
        style={{ display: "block", flexShrink: 0 }}
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="35%" stopColor="#FCD34D" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <g transform="translate(140,140) rotate(15)">
          <path
            d="M -45 -90 L 45 -90 L 45 -45 L 90 -45 L 90 45 L 45 45 L 45 90 L -45 90 L -45 45 L -90 45 L -90 -45 L -45 -45 Z"
            fill={`url(#${gradId})`}
            stroke="#1E3A8A"
            strokeWidth="14"
            strokeLinejoin="miter"
          />
        </g>
      </svg>
    </span>
  );
}
