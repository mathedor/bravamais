"use client";

import { motion } from "framer-motion";

interface Props {
  items: string[];
  speed?: number;
  className?: string;
}

export function CategoryMarquee({ items, speed = 35, className }: Props) {
  const doubled = [...items, ...items];

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex shrink-0 gap-12 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-12 text-4xl font-black tracking-tight md:text-6xl">
            <span className="text-white/15">{item}</span>
            <span className="text-brava-yellow">+</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
