"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
  categorias: { slug: string; name: string }[];
}

export function CategoryChips({ categorias }: Props) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-0">
      <div className="flex gap-3 px-4 pb-2 sm:px-0 sm:flex-wrap">
        {categorias.map((c, i) => (
          <motion.div
            key={c.slug}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
          >
            <Link
              href={`/app/buscar?categoria=${c.slug}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-brava-border bg-white px-4 py-2.5 text-sm font-medium text-brava-ink shadow-sm transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow-md"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brava-yellow text-brava-blue transition-transform group-hover:rotate-12">
                <span className="text-xs font-black">+</span>
              </span>
              {c.name}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
