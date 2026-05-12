"use client";

import Image from "next/image";
import { useTheme } from "./theme-provider";

interface Props {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  /** Força uma variante (ignora theme) */
  variant?: "light" | "dark";
}

/**
 * Logo da BRAVA+ que adapta cor da escrita ao tema:
 * - Light: BRAVA em preto, + amarelo
 * - Dark: BRAVA em branco, + amarelo
 */
export function BravaLogo({ width, height, className, priority, variant }: Props) {
  const { resolved } = useTheme();
  const mode = variant ?? resolved;
  const src = mode === "dark" ? "/logo-dark.svg" : "/logo.svg";

  return (
    <Image
      key={src}
      src={src}
      alt="BRAVA+"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
