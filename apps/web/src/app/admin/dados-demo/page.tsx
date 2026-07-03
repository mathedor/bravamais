import { requireRole } from "@/lib/auth-guard";
import { getDemoStats } from "@/lib/demo-data";
import { SeedPanel, ClearPanel } from "./panel";

export const metadata = { title: "Dados demo — Admin" };
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const LABELS: Record<string, string> = {
  demo_users: "Usuários demo",
  demo_estabs: "Estabelecimentos demo",
  visits: "Visitas",
  orders: "Pedidos",
  pos_sales: "Vendas balcão",
  payments: "Pagamentos",
  gift_cards: "Vale-presentes",
  coupon_redemptions: "Cupons usados",
  stories: "Stories",
  withdrawals: "Saques",
  refund_tickets: "Estornos",
  notifications: "Notificações",
};

export default async function DadosDemoPage() {
  await requireRole("admin");
  let stats: Record<string, number> = {};
  let statsError: string | null = null;
  try {
    stats = await getDemoStats();
  } catch (e) {
    statsError = e instanceof Error ? e.message : "erro";
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Admin · Ferramentas</p>
        <h1 className="mt-1 text-3xl font-black text-brava-ink">🧪 Dados demo</h1>
        <p className="mt-1 text-sm text-brava-muted">
          Limpe a base de dados fictícios antes de ativar pra valer, ou popule de novo pra testar.
        </p>
      </header>

      <section className="mb-6 rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-brava-muted">
          O que existe de fictício agora
        </h2>
        {statsError ? (
          <p className="mt-2 text-xs text-rose-600">
            Não consegui ler as contagens ({statsError}). Rode a migration 040 e recarregue.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(LABELS).map(([key, label]) => (
              <div key={key} className="rounded-2xl bg-brava-paper p-3 text-center">
                <p className="text-2xl font-black text-brava-ink">{stats[key] ?? 0}</p>
                <p className="text-[11px] text-brava-muted">{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <SeedPanel />
        <ClearPanel />
      </div>
    </div>
  );
}
