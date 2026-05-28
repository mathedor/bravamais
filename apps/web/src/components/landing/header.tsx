"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "#parceiros", label: "Parceiros" },
  { href: "#vantagens", label: "Vantagens" },
  { href: "#estabelecimento", label: "Pra estabelecimento" },
  { href: "#planos", label: "Planos" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? "bg-brava-black/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/" className="group inline-flex items-center gap-2">
            <Image src="/logo-dark.svg" alt="BRAVA+" width={130} height={48} priority />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/entrar"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/assinar"
              className="group relative overflow-hidden rounded-full bg-brava-yellow px-5 py-2.5 text-sm font-bold text-brava-black shadow-lg shadow-brava-yellow/20 transition-transform hover:scale-105"
            >
              <span className="relative z-10">Assinar agora</span>
              <span className="absolute inset-0 bg-gradient-to-r from-brava-yellow via-amber-300 to-brava-yellow opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              href="/entrar"
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/10"
            >
              Entrar
            </Link>
            <Link
              href="/assinar"
              className="rounded-full bg-brava-yellow px-3 py-1.5 text-xs font-bold text-brava-black shadow-md shadow-brava-yellow/30"
            >
              Cadastrar
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white"
              aria-label="Abrir menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brava-black md:hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-between px-6 py-4"
            >
              <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2.5 text-white"
                aria-label="Fechar menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>

            <nav className="mt-8 flex flex-col gap-2 px-6">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-white/5 py-5 text-3xl font-black tracking-tight text-white hover:text-brava-yellow"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 flex flex-col gap-3 px-6"
            >
              <Link
                href="/assinar"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-brava-yellow py-4 text-center text-base font-bold text-brava-black"
              >
                Assinar agora
              </Link>
              <Link
                href="/entrar"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/15 bg-white/5 py-4 text-center text-base font-medium text-white"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro-estabelecimento"
                onClick={() => setMobileOpen(false)}
                className="mt-3 rounded-full border border-brava-yellow/40 bg-brava-yellow/10 py-4 text-center text-sm font-medium text-brava-yellow"
              >
                Sou estabelecimento → cadastrar
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
