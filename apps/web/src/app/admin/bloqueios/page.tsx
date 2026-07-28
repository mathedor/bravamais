import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth-guard";
import { formatBRL } from "@/lib/format";
import { BloqueioForm, ResolverBloqueioButton } from "./forms";

export const metadata = { title: "Bloqueios — Admin" };

const RAZAO_LABEL: Record<string, string> = {
  chargeback_cartao: "Chargeback cartão",
  contestacao_pix: "Contestação PIX",
  reembolso: "Reembolso",
  repasse_excedente: "Repasse excedente",
  outro: "Outro",
};

interface Row {
  id: string;
  valor_centavos: number;
  razao: string;
  observacao: string | null;
  status: string;
  created_at: string;
  establishments: { name: string } | null;
}

export default async function BloqueiosPage() {
  await requireRole("admin");
  const admin = createAdminClient();

  const [{ data: blocksData }, { data: estabsData }] = await Promise.all([
    admin
      .from("financial_blocks")
      .select("id, valor_centavos, razao, observacao, status, created_at, establishments(name)")
      .order("created_at", { ascending: false })
      .limit(300),
    admin.from("establishments").select("id, name").order("name"),
  ]);

  const rows = (blocksData as unknown as Row[] | null) ?? [];
  const ativos = rows.filter((r) => r.status === "ativo");
  const resolvidos = rows.filter((r) => r.status === "resolvido");
  const totalAtivo = ativos.reduce((s, r) => s + r.valor_centavos, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Financeiro</p>
          <h1 className="mt-1 text-3xl font-black text-brava-ink">Bloqueios</h1>
          <p className="mt-1 text-sm text-brava-muted">
            Débitos que travam o saque do lojista. São cobertos primeiro pelo dinheiro que ainda
            está na plataforma; só o excedente reduz o disponível.
          </p>
        </div>
        {totalAtivo > 0 && (
          <span className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
            🚫 {formatBRL(totalAtivo)} ativos
          </span>
        )}
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="text-base font-bold">Novo bloqueio</h2>
        <div className="mt-4">
          <BloqueioForm estabs={estabsData ?? []} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-700">
          Ativos ({ativos.length})
        </h2>
        {ativos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Nenhum bloqueio ativo. 🎉
          </p>
        ) : (
          <div className="space-y-2">
            {ativos.map((r) => (
              <article
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/40 p-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brava-blue">
                    {r.establishments?.name ?? "—"}
                  </p>
                  <p className="text-xl font-black text-red-700">{formatBRL(r.valor_centavos)}</p>
                  <p className="text-xs text-brava-muted">
                    {RAZAO_LABEL[r.razao] ?? r.razao}
                    {r.observacao ? ` · ${r.observacao}` : ""} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <ResolverBloqueioButton id={r.id} />
              </article>
            ))}
          </div>
        )}
      </section>

      {resolvidos.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-bold text-brava-muted">
            Resolvidos ({resolvidos.length})
          </summary>
          <div className="mt-3 space-y-2">
            {resolvidos.map((r) => (
              <article
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brava-border bg-brava-card p-4 opacity-70"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brava-muted">
                    {r.establishments?.name ?? "—"}
                  </p>
                  <p className="text-lg font-black text-brava-ink">{formatBRL(r.valor_centavos)}</p>
                  <p className="text-xs text-brava-muted">
                    {RAZAO_LABEL[r.razao] ?? r.razao}
                    {r.observacao ? ` · ${r.observacao}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  RESOLVIDO
                </span>
              </article>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
