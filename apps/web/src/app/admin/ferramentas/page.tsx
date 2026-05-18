import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";

const TOOLS = [
  { href: "/admin/ferramentas/wallet", emoji: "💰", title: "BRAVA Wallet — packs de bônus", desc: "Configure quanto deposita → quanto ganha de bônus" },
  { href: "/admin/ferramentas/badges", emoji: "🥇", title: "Badges de explorador", desc: "Conquistas, regras, recompensas em coins" },
  { href: "/admin/ferramentas/sazonalidade", emoji: "🎉", title: "Templates sazonais", desc: "Festa Junina, Black Friday, Natal — pre-fills pra lojista" },
  { href: "/admin/ferramentas/treinamentos", emoji: "🎓", title: "Treinamento in-app", desc: "Vídeos curtos por público" },
  { href: "/admin/ferramentas/grupos", emoji: "🎉", title: "Rolês em grupo (monitor)", desc: "Lista todos os rolês ativos no sistema" },
  { href: "/admin/ferramentas/wallet/saldos", emoji: "📊", title: "Saldos & movimento Wallet", desc: "Caixa total, depósitos, gastos" },
  { href: "/admin/ferramentas/mesa-qr", emoji: "🪑", title: "Mesa QR (monitor)", desc: "Mesas ativas + scans recentes" },
  { href: "/admin/ferramentas/parcerias", emoji: "🤝", title: "Parcerias entre lojistas", desc: "Lista, status, gross merchandise dos combos" },
  { href: "/admin/ferramentas/ab-test", emoji: "🧪", title: "A/B tests (monitor)", desc: "Testes rodando + vencedores" },
  { href: "/admin/ferramentas/lista-espera", emoji: "⏳", title: "Filas de espera ativas", desc: "Lojas com fila + tempo médio" },
];

export default async function AdminFerramentasHub() {
  await requireRole("admin");
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">ferramentas</div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Ferramentas do sistema</h1>
        <p className="text-sm text-brava-muted">CRUD + monitor + relatórios pra cada nova ferramenta do BRAVA+.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border border-brava-border bg-brava-card p-4 transition hover:border-brava-yellow">
            <div className="text-2xl">{t.emoji}</div>
            <div className="mt-1 font-bold">{t.title}</div>
            <div className="mt-1 text-xs text-brava-muted">{t.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
