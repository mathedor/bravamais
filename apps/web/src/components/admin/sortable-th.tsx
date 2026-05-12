"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Props {
  field: string;
  label: string;
  className?: string;
  numeric?: boolean;
}

export function SortableTh({ field, label, className, numeric }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const currentSort = params.get("sort");
  const currentDir = params.get("dir");

  const isActive = currentSort === field;
  let nextDir = "asc";
  if (isActive && currentDir === "asc") nextDir = "desc";
  else if (isActive && currentDir === "desc") nextDir = "asc";

  const next = new URLSearchParams(params);
  next.set("sort", field);
  next.set("dir", nextDir);

  return (
    <th className={`px-4 py-3 ${numeric ? "text-right" : "text-left"} ${className ?? ""}`}>
      <Link
        href={`${pathname}?${next.toString()}`}
        className={`inline-flex items-center gap-1 transition ${isActive ? "text-brava-blue" : "text-brava-muted hover:text-brava-ink"}`}
      >
        {label}
        <span className="text-[10px]">
          {isActive ? (currentDir === "desc" ? "↓" : "↑") : "↕"}
        </span>
      </Link>
    </th>
  );
}
