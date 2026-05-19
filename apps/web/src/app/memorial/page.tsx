import Image from "next/image";
import { PrintButton } from "@/components/apresentacao/print-button";
import { helpsByRole, ROLE_META, DEMO_LOGINS, type RoleKey } from "./data";
import {
  MockupApp, MockupCarteirinha, MockupWallet,
  MockupLojaDashboard, MockupQrScan, MockupBlast,
  MockupEntregador, MockupComercial, MockupAdmin,
} from "./mockups";

export const metadata = {
  title: "Memorial Descritivo · BRAVA+",
  description: "Documento técnico completo da plataforma BRAVA+ por nível de usuário, com logins de teste e descrição de todas as funcionalidades.",
};

const MOCKUPS_BY_ROLE: Record<RoleKey, { titulo: string; comp: React.ReactNode }[]> = {
  usuario: [
    { titulo: "Tela inicial do app (home)", comp: <MockupApp /> },
    { titulo: "Carteirinha BRAVA+ (QR)", comp: <MockupCarteirinha /> },
    { titulo: "BRAVA Wallet (recarga com bônus)", comp: <MockupWallet /> },
  ],
  lojista: [
    { titulo: "Dashboard do lojista", comp: <MockupLojaDashboard /> },
    { titulo: "Scanner QR no caixa", comp: <MockupQrScan /> },
    { titulo: "Promo Blast (hora vazia)", comp: <MockupBlast /> },
  ],
  entregador: [
    { titulo: "Painel entregador (online + ofertas)", comp: <MockupEntregador /> },
  ],
  comercial: [
    { titulo: "CRM Kanban do comercial", comp: <MockupComercial /> },
  ],
  admin: [
    { titulo: "Dashboard admin com KPIs", comp: <MockupAdmin /> },
  ],
};

export default function MemorialPage() {
  const helps = helpsByRole();
  const ROLE_ORDER: RoleKey[] = ["usuario", "lojista", "entregador", "comercial", "admin"];

  return (
    <>
      {/* ============ CSS PRINT (A4 com header/footer) ============ */}
      <style>{`
        @page {
          size: A4;
          margin: 22mm 16mm 22mm 16mm;
          @top-left {
            content: "BRAVA+ · Memorial Descritivo";
            font-family: Inter, sans-serif;
            font-size: 9pt;
            font-weight: 700;
            color: #0A0A0A;
            border-bottom: 1px solid #FBBF24;
            padding-bottom: 4mm;
            width: 100%;
          }
          @bottom-left {
            content: "BRAVA+ © 2026 · documento confidencial";
            font-family: Inter, sans-serif;
            font-size: 8pt;
            color: #71717A;
          }
          @bottom-right {
            content: "página " counter(page) " de " counter(pages);
            font-family: Inter, sans-serif;
            font-size: 8pt;
            color: #71717A;
          }
        }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #0A0A0A !important; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          .feature-card, .mockup-card, .login-card { page-break-inside: avoid; break-inside: avoid; }
        }
        @media screen {
          body { background: #fafaf9; }
          .memorial-page { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; }
        }
      `}</style>

      <div className="memorial-page">
        {/* ============ AÇÕES ============ */}
        <div className="no-print mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-brava-yellow bg-brava-yellow/10 p-4">
          <div className="text-sm">
            <strong className="text-brava-ink">📄 Memorial Descritivo BRAVA+</strong>
            <p className="mt-1 text-xs text-brava-muted">
              Pra gerar o PDF: <strong>Ctrl+P</strong> (ou ⌘+P) → "Salvar como PDF" → escolha A4 e marque "Gráficos de fundo".
            </p>
          </div>
          <PrintButton />
        </div>

        {/* ============ CAPA ============ */}
        <section className="page-break" style={{ minHeight: "calc(100vh - 100px)" }}>
          <div className="flex h-full flex-col items-center justify-center text-center" style={{ paddingTop: 80, paddingBottom: 80 }}>
            <div className="mb-12">
              <Image src="/logo.svg" alt="BRAVA+" width={200} height={70} priority />
            </div>
            <div className="text-xs font-mono uppercase tracking-[0.4em] text-brava-blue">
              MEMORIAL DESCRITIVO
            </div>
            <h1 className="mt-6 text-6xl font-black tracking-tight text-brava-ink">
              Plataforma BRAVA<span className="text-brava-yellow">+</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-brava-muted">
              Documento técnico completo da plataforma. Todas as funcionalidades por nível de usuário, com logins de teste e descrição funcional detalhada.
            </p>
            <div className="mt-16 grid grid-cols-5 gap-4 text-center">
              {ROLE_ORDER.map((r) => (
                <div key={r} className="px-3 py-2 rounded-xl border-2 border-brava-border" style={{ minWidth: 90 }}>
                  <div className="text-3xl">{ROLE_META[r].emoji}</div>
                  <div className="mt-1 text-xs font-bold text-brava-ink">{ROLE_META[r].label.split(" ")[0]}</div>
                  <div className="text-[10px] text-brava-muted">{helps[r].length} telas</div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-16 text-xs text-brava-muted">
              Versão: 2026.05 · brava-mais.vercel.app
            </div>
          </div>
        </section>

        {/* ============ SUMÁRIO ============ */}
        <section className="page-break">
          <h2 className="text-3xl font-black text-brava-ink">Sumário</h2>
          <hr className="my-3 border-brava-yellow border-t-2" />
          <ol className="space-y-2 mt-6 text-sm">
            <li><strong>1.</strong> Visão geral da plataforma <span className="text-brava-muted">............................</span> pág. 3</li>
            <li><strong>2.</strong> Logins de teste (todos os níveis) <span className="text-brava-muted">............................</span> pág. 4</li>
            <li><strong>3.</strong> Stack técnico <span className="text-brava-muted">............................</span> pág. 5</li>
            {ROLE_ORDER.map((r, i) => (
              <li key={r}><strong>{i + 4}.</strong> {ROLE_META[r].emoji} {ROLE_META[r].label} — {helps[r].length} funcionalidades</li>
            ))}
          </ol>
        </section>

        {/* ============ 1. VISÃO GERAL ============ */}
        <section className="page-break">
          <SectionTitle numero="1" titulo="Visão geral da plataforma" />
          <p className="mt-4 text-sm leading-relaxed text-brava-ink">
            <strong>BRAVA+</strong> é uma plataforma de clube de vantagens por assinatura,
            que conecta <strong>assinantes</strong>, <strong>estabelecimentos parceiros</strong>,
            <strong> entregadores freelance</strong> e <strong>comerciais de campo</strong> em um único ecossistema digital.
            O modelo combina receita recorrente (assinatura), comissão de vendas (delivery e produtos),
            slots pagos de destaque, B2B corporativo, e captação descentralizada via representantes.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <InfoBlock titulo="Modelo de receita" itens={[
              "Mensalidade do assinante (R$ 19,90 / R$ 39,90 / R$ 79,90)",
              "Comissão em pedidos do catálogo (% via Efí)",
              "Plano lojista premium (R$ 49-149/mês)",
              "Slots pagos de destaque",
              "BRAVA+ Empresas (B2B benefício corporativo)",
            ]} />
            <InfoBlock titulo="Identidade visual" itens={[
              "Paleta: amarelo (#FBBF24) + azul (#1E3A8A) + preto",
              'Logo: o "+" é elemento gráfico hero',
              "Tipografia: Inter (web), tipografia bold massivo nos heros",
              "URLs: brava-mais.vercel.app (produção)",
            ]} />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-black text-brava-ink">Os 5 níveis de usuário</h3>
            <div className="mt-3 space-y-2">
              {ROLE_ORDER.map((r) => (
                <div key={r} className="rounded-xl border border-brava-border bg-brava-card p-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl">{ROLE_META[r].emoji}</span>
                    <strong className="text-brava-ink">{ROLE_META[r].label}</strong>
                    <span className="text-xs text-brava-muted">· {helps[r].length} funcionalidades documentadas</span>
                  </div>
                  <p className="mt-1 text-xs text-brava-muted">{ROLE_META[r].tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ 2. LOGINS DE TESTE ============ */}
        <section className="page-break">
          <SectionTitle numero="2" titulo="Logins de teste — todos os níveis" />
          <p className="mt-4 text-sm text-brava-ink">
            Use estes acessos pra navegar pela plataforma. Cada conta já está provisionada com dados de demonstração.
          </p>
          <div className="mt-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-xs">
            <strong>⚠ Confidencial:</strong> contas <strong>somente pra avaliação</strong>. Não compartilhe externamente.
            URL de login: <strong>https://brava-mais.vercel.app/entrar</strong>
          </div>

          <div className="mt-5 space-y-3">
            {DEMO_LOGINS.map((l) => (
              <div key={l.email} className="login-card rounded-xl border-2 border-brava-border bg-brava-card p-4">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{l.emoji}</div>
                  <div className="flex-1">
                    <div className="text-base font-black text-brava-ink">{l.role}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="font-mono text-brava-muted text-[10px] uppercase">email</div>
                        <div className="font-mono font-bold">{l.email}</div>
                      </div>
                      <div>
                        <div className="font-mono text-brava-muted text-[10px] uppercase">senha</div>
                        <div className="font-mono font-bold">{l.password}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-brava-muted">painel: </span>
                      <span className="font-mono">https://brava-mais.vercel.app{l.url}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ 3. STACK ============ */}
        <section className="page-break">
          <SectionTitle numero="3" titulo="Stack técnico" />
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <TechBlock titulo="Frontend" itens={[
              "Next.js 16.2 (App Router + Turbopack)",
              "React 19 + TypeScript",
              "Tailwind v4 (CSS-vars nativas)",
              "Framer Motion (animações)",
              "Leaflet + Mapbox (mapas)",
              "shadcn/ui (componentes base)",
            ]} />
            <TechBlock titulo="Backend" itens={[
              "Supabase (Postgres + Auth + Realtime + Storage)",
              "Row-Level Security em todas as tabelas",
              "Server Actions (Next.js)",
              "PostGIS (busca por proximidade)",
            ]} />
            <TechBlock titulo="Integrações" itens={[
              "Efí Bank (PIX + cartão recorrente)",
              "Google Maps / Places (prospecção)",
              "OneSignal (push web)",
              "ViaCEP (busca de endereço)",
              "ReceitaWS (auto-busca CNPJ)",
            ]} />
            <TechBlock titulo="Deploy" itens={[
              "Vercel (produção)",
              "GitHub Actions (CI/CD)",
              "Vercel Cron (jobs agendados)",
              "Supabase Dashboard (banco)",
              "Monorepo Turborepo + pnpm",
            ]} />
          </div>
        </section>

        {/* ============ 4-8. UMA SEÇÃO POR ROLE ============ */}
        {ROLE_ORDER.map((role, idx) => {
          const meta = ROLE_META[role];
          const list = helps[role];
          const mockups = MOCKUPS_BY_ROLE[role] ?? [];

          return (
            <section key={role} className="page-break">
              <SectionTitle numero={String(idx + 4)} titulo={`${meta.emoji} ${meta.label}`} />
              <p className="mt-3 text-sm text-brava-ink">{meta.tagline}</p>

              {/* Mockups visuais */}
              {mockups.length > 0 && (
                <div className="avoid-break mt-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-brava-muted">
                    Telas principais ({mockups.length})
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {mockups.map((m, i) => (
                      <div key={i} className="mockup-card flex flex-col items-center">
                        {m.comp}
                        <div className="mt-2 max-w-[220px] text-center text-xs text-brava-muted">
                          <strong className="text-brava-ink">Fig {idx + 1}.{i + 1}</strong> — {m.titulo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Funcionalidades */}
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brava-muted">
                  Funcionalidades documentadas ({list.length})
                </h3>
                <div className="mt-3 space-y-3">
                  {list.map(({ key, entry }) => (
                    <FeatureCard key={key} entry={entry} pageHelpKey={key} />
                  ))}
                </div>
              </div>
            </section>
          );
        })}

        {/* ============ FECHO ============ */}
        <section className="page-break">
          <SectionTitle numero="9" titulo="Considerações finais" />
          <p className="mt-4 text-sm text-brava-ink leading-relaxed">
            Este memorial cobre a totalidade das funcionalidades em produção da plataforma BRAVA+ até a data de emissão. Todas as telas estão acessíveis aos perfis correspondentes, com onboarding interno (tour completo de boas-vindas) e mini-ajuda contextual ("Como eu utilizo essa área?") em cada uma.
          </p>
          <p className="mt-4 text-sm text-brava-ink leading-relaxed">
            Para questões técnicas, suporte ou demonstração ao vivo, contato direto pelo email <strong>contato@bravamais.app</strong> ou pelo WhatsApp do time comercial.
          </p>
          <div className="mt-12 rounded-2xl border-2 border-brava-yellow bg-brava-yellow/10 p-6 text-center">
            <Image src="/logo.svg" alt="BRAVA+" width={140} height={50} className="mx-auto" />
            <div className="mt-4 text-xs uppercase tracking-widest text-brava-muted">
              Memorial Descritivo · Versão 2026.05 · BRAVA+ © 2026
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ============ COMPONENTES ============ */

function SectionTitle({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-brava-blue">Seção {numero}</div>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-brava-ink">{titulo}</h2>
      <hr className="my-3 border-t-2 border-brava-yellow" />
    </div>
  );
}

function InfoBlock({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div className="rounded-xl border border-brava-border bg-brava-card p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-brava-blue">{titulo}</div>
      <ul className="mt-2 space-y-1 text-xs text-brava-ink">
        {itens.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}

function TechBlock({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div className="rounded-xl border border-brava-border bg-brava-card p-4">
      <div className="text-xs font-bold uppercase tracking-wider text-brava-yellow">{titulo}</div>
      <ul className="mt-2 space-y-1 text-xs text-brava-ink">
        {itens.map((it, i) => <li key={i}>• {it}</li>)}
      </ul>
    </div>
  );
}

function FeatureCard({ entry, pageHelpKey }: { entry: any; pageHelpKey: string }) {
  return (
    <div className="feature-card rounded-xl border border-brava-border bg-brava-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-black text-brava-ink">{entry.titulo}</h4>
          {entry.path && <div className="mt-0.5 font-mono text-[10px] text-brava-muted">{entry.path}</div>}
        </div>
        <span className="rounded bg-brava-paper px-2 py-0.5 font-mono text-[9px] uppercase text-brava-muted">{pageHelpKey}</span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-brava-ink">{entry.resumo}</p>

      {entry.oQueFaz && entry.oQueFaz.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">O que essa tela faz</div>
          <ul className="mt-1 space-y-0.5 text-[11px] text-brava-ink">
            {entry.oQueFaz.map((it: string, i: number) => <li key={i}>• {it}</li>)}
          </ul>
        </div>
      )}

      {entry.comoUsar && entry.comoUsar.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">Como usar</div>
          <ol className="mt-1 space-y-0.5 text-[11px] text-brava-ink list-decimal pl-5">
            {entry.comoUsar.map((it: string, i: number) => <li key={i}>{it}</li>)}
          </ol>
        </div>
      )}

      {entry.campos && entry.campos.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">Campos do formulário</div>
          <ul className="mt-1 space-y-0.5 text-[11px] text-brava-ink">
            {entry.campos.map((c: any, i: number) => (
              <li key={i}>
                <strong>{c.nome}</strong>{c.obrigatorio && <span className="ml-1 text-red-600">(obrigatório)</span>} — {c.desc}
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.calculos && entry.calculos.length > 0 && (
        <div className="mt-3 rounded-lg bg-brava-paper p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">Cálculos</div>
          <ul className="mt-1 space-y-0.5 font-mono text-[10px] text-brava-ink">
            {entry.calculos.map((c: string, i: number) => <li key={i}>∑ {c}</li>)}
          </ul>
        </div>
      )}

      {entry.objetivoRelatorio && (
        <div className="mt-3 rounded-lg border border-brava-blue/30 bg-brava-blue/5 p-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">Objetivo deste relatório</div>
          <p className="mt-1 text-[11px] text-brava-ink">🎯 {entry.objetivoRelatorio}</p>
        </div>
      )}

      {entry.dicas && entry.dicas.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brava-blue">Dicas</div>
          <ul className="mt-1 space-y-0.5 text-[11px] text-brava-ink">
            {entry.dicas.map((d: string, i: number) => <li key={i}>💡 {d}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
