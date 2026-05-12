"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface Ctx {
  theme: ThemeMode;
  resolved: Resolved;
  setTheme: (t: ThemeMode) => void;
}

const Ctx = createContext<Ctx | null>(null);
const KEY = "brava:theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved theme + monitor system pref
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(KEY) as ThemeMode | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    function onChange(e: MediaQueryListEvent) {
      setSystemDark(e.matches);
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: Resolved = useMemo(() => {
    if (theme === "system") return systemDark ? "dark" : "light";
    return theme;
  }, [theme, systemDark]);

  // Apply class to <html> while this provider is mounted
  useEffect(() => {
    if (!mounted) return;
    const el = document.documentElement;
    el.classList.toggle("theme-dark", resolved === "dark");
    return () => {
      el.classList.remove("theme-dark");
    };
  }, [resolved, mounted]);

  function setTheme(t: ThemeMode) {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  }

  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) {
    return { theme: "system" as ThemeMode, resolved: "light" as Resolved, setTheme: () => {} };
  }
  return c;
}
