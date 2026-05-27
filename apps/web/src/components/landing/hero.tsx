"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

interface Props {
  stats: { estabs: number; cupons: number; categorias: number };
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export function LandingHero({ stats }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax e rotação leve no + gigante baseado em scroll
  const plusY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const plusRotate = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const plusScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const plusOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);

  // Spring suave nas transforms
  const smoothPlusY = useSpring(plusY, { stiffness: 80, damping: 20 });
  const smoothPlusRotate = useSpring(plusRotate, { stiffness: 80, damping: 20 });

  return (
    <section
      ref={containerRef}
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden bg-brava-black pt-28 text-white"
    >
      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.5, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-brava-blue blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-brava-yellow blur-3xl"
        />
      </div>

      {/* Gigantic floating + invading from the right */}
      <motion.div
        style={{ y: smoothPlusY, rotate: smoothPlusRotate, scale: plusScale, opacity: plusOpacity }}
        className="pointer-events-none absolute -right-[28%] top-1/2 z-0 -translate-y-1/2 sm:-right-[15%] lg:-right-[8%]"
      >
        <motion.div
          animate={{ y: [0, -24, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            viewBox="0 0 400 400"
            className="h-[62vh] w-[62vh] max-w-[1400px] drop-shadow-[0_25px_80px_rgba(251,191,36,0.45)] sm:h-[90vh] sm:w-[90vh]"
            aria-hidden
          >
            <defs>
              <linearGradient id="plusGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFD466" />
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <g transform="translate(200,200)">
              <path
                d="M -55 -160 L 55 -160 Q 70 -160 70 -145 L 70 -85 Q 70 -70 85 -70 L 145 -70 Q 160 -70 160 -55 L 160 55 Q 160 70 145 70 L 85 70 Q 70 70 70 85 L 70 145 Q 70 160 55 160 L -55 160 Q -70 160 -70 145 L -70 85 Q -70 70 -85 70 L -145 70 Q -160 70 -160 55 L -160 -55 Q -160 -70 -145 -70 L -85 -70 Q -70 -70 -70 -85 L -70 -145 Q -70 -160 -55 -160 Z"
                fill="url(#plusGrad)"
                stroke="#1E3A8A"
                strokeWidth="20"
              />
            </g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Scrim: escurece a coluna do texto pra ele não sumir sobre o "+".
          Mais forte no mobile (onde o + invade mais), some à direita pra
          deixar o + ainda aparecendo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-brava-black via-brava-black/75 to-transparent md:via-brava-black/35"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-12">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="inline-flex items-center gap-2 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brava-yellow backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brava-yellow" />
          Clube de vantagens · Em breve no Brasil
        </motion.span>

        <h1 className="hero-title-stroke mt-8 max-w-5xl text-[clamp(3.5rem,11vw,11rem)] font-black leading-[0.85] tracking-tight">
          <motion.span
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: easeOut }}
            className="block"
          >
            mais
          </motion.span>
          <motion.span
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
            className="block bg-gradient-to-r from-brava-yellow via-amber-300 to-brava-yellow bg-clip-text text-transparent"
          >
            economia.
          </motion.span>
          <motion.span
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: easeOut }}
            className="block"
          >
            mais
          </motion.span>
          <motion.span
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: easeOut }}
            className="block bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent"
          >
            BRAVA+
          </motion.span>
        </h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: easeOut }}
          className="mt-10 max-w-xl text-lg text-white/75 sm:text-xl md:text-2xl"
        >
          {stats.estabs} estabelecimentos parceiros, {stats.cupons}+ cupons ativos e benefícios reais nos lugares que você frequenta. Tudo num clube.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75, ease: easeOut }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/assinar"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-brava-yellow px-8 py-5 text-base font-bold text-brava-black shadow-2xl shadow-black/40 ring-2 ring-brava-blue/40 transition-transform hover:scale-[1.04]"
          >
            <span className="relative z-10">Quero assinar</span>
            <svg className="relative z-10 transition-transform group-hover:translate-x-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </Link>

          <Link
            href="/cadastro-estabelecimento"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-8 py-5 text-base font-medium text-white backdrop-blur transition hover:bg-white/10 hover:border-white/40"
          >
            Sou estabelecimento
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1, ease: easeOut }}
          className="mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-8"
        >
          <Stat n={stats.estabs} suffix="" label="parceiros" />
          <Stat n={stats.cupons} suffix="+" label="cupons ativos" />
          <Stat n={5} suffix="" label="tipos de promoção" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [0, 8, 0], opacity: 1 }}
        transition={{ y: { duration: 2, repeat: Infinity, ease: "easeInOut" }, opacity: { delay: 1.5 } }}
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40"
        aria-hidden
      >
        <svg width="20" height="32" viewBox="0 0 20 32" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="1" width="18" height="30" rx="9" />
          <circle cx="10" cy="10" r="2" fill="currentColor" />
        </svg>
      </motion.div>
    </section>
  );
}

function Stat({ n, suffix, label }: { n: number; suffix: string; label: string }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: easeOut }}
    >
      <p className="hero-title-stroke text-4xl font-black text-brava-yellow md:text-5xl">
        {n}
        {suffix}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
    </motion.div>
  );
}
