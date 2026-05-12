import Link from "next/link";
import { requireEstablishment } from "@/lib/establishment-guard";

export const metadata = { title: "Mais — Loja" };

const ITEMS = [
  { href: "/loja/perfil", emoji: "🏷️", title: "Editar perfil", desc: "Foto, descrição, endereço, contato" },
  { href: "/loja/catalogo", emoji: "📦", title: "Catálogo", desc: "Produtos e preços" },
  { href: "/loja/cupons", emoji: "🎟️", title: "Cupons", desc: "Códigos promocionais" },
  { href: "/loja/vale-presente", emoji: "🎁", title: "Vale-presente", desc: "Comprados pelos clientes" },
  { href: "/loja/fidelidade", emoji: "⭐", title: "Clube de fidelidade", desc: "Configurar recompensa" },
  { href: "/loja/qr-scanner", emoji: "📷", title: "Ler QR", desc: "Marcar visita do cliente" },
  { href: "/loja/pedidos", emoji: "🛒", title: "Pedidos online", desc: "Vendas pelo BRAVA+" },
  { href: "/loja/clientes", emoji: "👥", title: "Clientes", desc: "Quem mais visita" },
  { href: "/loja/hoje", emoji: "📸", title: "Hoje (stories)", desc: "Atualizações diárias" },
];

export default async function LojaMais() {
  await requireEstablishment();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Loja</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Tudo da sua loja</h1>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-brava-border bg-white p-4 transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brava-paper text-2xl">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brava-ink">{item.title}</p>
                <p className="text-xs text-brava-muted">{item.desc}</p>
              </div>
              <span className="text-brava-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-6" />
    </div>
  );
}
