import type { Metadata, Viewport } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/lenis-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BRAVA+ · Clube de vantagens",
    template: "%s · BRAVA+",
  },
  description:
    "Assine o BRAVA+ e desbloqueie descontos, cupons, vale-presente e clube de fidelidade nos seus estabelecimentos favoritos.",
  applicationName: "BRAVA+",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "BRAVA+", statusBarStyle: "black-translucent" },
  icons: {
    icon: "/logo-mark.svg",
    apple: "/icon-app.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${fredoka.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-brava-paper text-brava-ink">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
