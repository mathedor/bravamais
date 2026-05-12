"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export interface FeaturedItem {
  slug: string;
  name: string;
  category: string | null;
  cover: string | null;
  logo: string | null;
}

export function FeaturedRow({ items }: { items: FeaturedItem[] }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-0">
      <div className="flex gap-4 px-4 pb-2 sm:px-0">
        {items.map((item, i) => (
          <motion.div
            key={item.slug}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="shrink-0"
          >
            <Link
              href={`/app/estabelecimento/${item.slug}`}
              className="group block w-[220px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-brava-paper">
                <div className="absolute inset-[2px] z-10 overflow-hidden rounded-3xl">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.name}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-brava-yellow to-amber-500" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {item.category && (
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brava-yellow">
                        {item.category}
                      </p>
                    )}
                    <p className="line-clamp-2 text-sm font-bold leading-tight text-white">
                      {item.name}
                    </p>
                  </div>
                </div>
                {/* Animated gradient border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #FBBF24, #1E3A8A, #FBBF24, #2563EB, #FBBF24)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
