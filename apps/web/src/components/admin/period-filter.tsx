"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const PERIODS = [
  { value: "", label: "Sempre" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
  { value: "1y", label: "1 ano" },
];

export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const current = params.get("period") ?? "";

  function pick(value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set("period", value);
    else next.delete("period");
    start(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="inline-flex flex-wrap gap-1.5">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          type="button"
          disabled={pending}
          onClick={() => pick(p.value)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
            current === p.value
              ? "border-brava-blue bg-brava-blue text-white"
              : "border-brava-border bg-brava-card text-brava-ink"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function periodToDate(period: string | undefined): Date | null {
  if (!period) return null;
  const now = Date.now();
  if (period === "7d") return new Date(now - 7 * 86400000);
  if (period === "30d") return new Date(now - 30 * 86400000);
  if (period === "90d") return new Date(now - 90 * 86400000);
  if (period === "1y") return new Date(now - 365 * 86400000);
  return null;
}
