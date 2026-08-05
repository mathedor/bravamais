"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIS_SERVICOS,
  CAMBIO,
  CONTAS_FIXAS,
  DEV_MESES,
  DEV_TOTAL_CENTS,
  DEV_TOTAL_ITENS,
  DEV_TOTAL_TOKENS,
  ENTREGA_V1,
  SETUP_CENTS,
  SETUP_ORIGEM,
  TIERS,
  TOTAL_MENSAL_CENTS,
  brl,
  mesesAte,
  nomeMes,
  tokensFmt,
  type Tier,
} from "./data";

/* ============================================================================
   Estado local (localStorage) — "pago" e overrides de valor
   ========================================================================== */
const STORAGE_KEY = "brava-custos-v1";

interface Extra {
  id: string;
  titulo: string;
  cents: number;
  data: string;
  recorrenteDe?: string;
  obs?: string;
}

interface Estado {
  pagos: Record<string, boolean>;
  overrides: Record<string, number>;
  extras: Extra[];
}

const ESTADO_VAZIO: Estado = { pagos: {}, overrides: {}, extras: [] };

/* ============================================================================
   Ícones desenhados (stroke SVG) — nada de emoji na iconografia
   ========================================================================== */
type IconProps = { className?: string };

function IcoChevron({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoCheck({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoPlus({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
function IcoAlerta({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3.5 2.8 19.5h18.4L12 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 9.5v4.2M12 16.8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IcoCofre({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2.8" y="4.8" width="18.4" height="14.4" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="10.5" cy="12" r="3.2" stroke="currentColor" strokeWidth="2" />
      <path d="M17.5 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IcoCalendario({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3.2" y="5" width="17.6" height="15" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M3.2 10h17.6M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IcoCodigo({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m8.5 8-4.5 4 4.5 4M15.5 8l4.5 4-4.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoPlug({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 3v5M15 3v5M5.5 8h13v3.5a6.5 6.5 0 0 1-13 0V8ZM12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IcoLapis({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
function IcoLixeira({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l1 12.2h9L17.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================================================================
   Página
   ========================================================================== */
export function CustosClient() {
  const [estado, setEstado] = useState<Estado>(ESTADO_VAZIO);
  const [carregado, setCarregado] = useState(false);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [formAberto, setFormAberto] = useState(false);

  const hoje = useMemo(() => new Date(), []);
  const mesCorrente = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const meses = useMemo(() => mesesAte(hoje), [hoje]);

  /* ---------- localStorage ---------- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Estado>;
        setEstado({
          pagos: parsed.pagos ?? {},
          overrides: parsed.overrides ?? {},
          extras: parsed.extras ?? [],
        });
      }
    } catch {
      /* estado corrompido: começa limpo */
    }
    setCarregado(true);
    setAbertos({ [`mes:${mesCorrente}`]: true, setup: true, dev: true, apis: false, [`dev:${DEV_MESES[0]?.mes}`]: true });
  }, [mesCorrente]);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {
      /* quota cheia: segue sem persistir */
    }
  }, [estado, carregado]);

  /* ---------- helpers de estado ---------- */
  const pago = (k: string) => !!estado.pagos[k];
  const valor = (k: string, base: number) => estado.overrides[k] ?? base;

  function togglePago(k: string) {
    setEstado((e) => ({ ...e, pagos: { ...e.pagos, [k]: !e.pagos[k] } }));
  }
  function marcarVarios(keys: string[], v: boolean) {
    setEstado((e) => {
      const pagos = { ...e.pagos };
      keys.forEach((k) => {
        pagos[k] = v;
      });
      return { ...e, pagos };
    });
  }
  function salvarOverride(k: string, texto: string) {
    const limpo = texto.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(limpo);
    setEstado((e) => {
      const overrides = { ...e.overrides };
      if (!texto.trim() || Number.isNaN(n)) delete overrides[k];
      else overrides[k] = Math.round(n * 100);
      return { ...e, overrides };
    });
    setEditando(null);
  }
  const toggleAberto = (k: string) => setAbertos((a) => ({ ...a, [k]: !a[k] }));

  /* ---------- montagem das linhas de cada mês ---------- */
  interface LinhaMes {
    key: string;
    label: string;
    obs: string;
    cents: number;
    estimado?: boolean;
    usd?: number;
    extraId?: string;
  }

  function linhasDoMes(mes: string): LinhaMes[] {
    const fixas: LinhaMes[] = CONTAS_FIXAS.map((c) => {
      const key = `m:${mes}:${c.slug}`;
      return { key, label: c.label, obs: c.obs, cents: valor(key, c.cents), estimado: c.estimado, usd: c.usd };
    });
    const extras: LinhaMes[] = estado.extras
      .filter((x) =>
        x.recorrenteDe ? mes >= x.recorrenteDe : (x.data ?? "").slice(0, 7) === mes,
      )
      .map((x) => {
        const key = `m:${mes}:x:${x.id}`;
        return {
          key,
          label: x.titulo,
          obs: x.obs || (x.recorrenteDe ? `recorrente desde ${nomeMes(x.recorrenteDe)}` : "custo avulso"),
          cents: valor(key, x.cents),
          extraId: x.id,
        };
      });
    return [...fixas, ...extras];
  }

  /* ---------- KPIs ---------- */
  const devCents = DEV_MESES.reduce(
    (s, g) => s + g.itens.reduce((si, it, i) => si + valor(`d:${g.mes}:${i}`, TIERS[it[3]].cents), 0),
    0,
  );
  const setupCents = valor("setup", SETUP_CENTS);
  const totalInvestido = setupCents + devCents;
  const custoMensalAtual = linhasDoMes(mesCorrente).reduce((s, l) => s + l.cents, 0);

  const grupoCorrente = DEV_MESES.find((g) => g.mes === mesCorrente);
  const devMesCents = grupoCorrente
    ? grupoCorrente.itens.reduce((s, it, i) => s + valor(`d:${grupoCorrente.mes}:${i}`, TIERS[it[3]].cents), 0)
    : 0;
  const devMesPagoCents = grupoCorrente
    ? grupoCorrente.itens.reduce(
        (s, it, i) => s + (pago(`d:${grupoCorrente.mes}:${i}`) ? valor(`d:${grupoCorrente.mes}:${i}`, TIERS[it[3]].cents) : 0),
        0,
      )
    : 0;
  const devMesPct = devMesCents ? Math.round((devMesPagoCents / devMesCents) * 100) : 0;

  /* ---------- form de custo novo ---------- */
  function registrarCusto(fd: FormData) {
    const titulo = String(fd.get("titulo") ?? "").trim();
    const valorTxt = String(fd.get("valor") ?? "").replace(/\./g, "").replace(",", ".");
    const cents = Math.round(Number(valorTxt) * 100);
    if (!titulo || !Number.isFinite(cents) || cents <= 0) return;
    const novo: Extra = {
      id: `${Date.now().toString(36)}`,
      titulo,
      cents,
      data: String(fd.get("data") ?? "") || new Date().toISOString().slice(0, 10),
      recorrenteDe: String(fd.get("recorrente") ?? "") || undefined,
      obs: String(fd.get("obs") ?? "").trim() || undefined,
    };
    setEstado((e) => ({ ...e, extras: [...e.extras, novo] }));
    setFormAberto(false);
  }
  function removerExtra(id: string) {
    setEstado((e) => ({ ...e, extras: e.extras.filter((x) => x.id !== id) }));
  }

  /* ---------- render ---------- */
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Administração</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-brava-ink">Custos &amp; Desenvolvimento</h1>
          <p className="mt-1 max-w-2xl text-sm text-brava-muted">
            Quanto o BRAVA+ custou para existir, quanto custa para se manter no ar todo mês e tudo que foi
            construído desde a entrega da primeira versão.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormAberto((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-brava-yellow px-4 py-2.5 text-sm font-black text-brava-black transition hover:brightness-95"
        >
          <IcoPlus className="h-4 w-4" />
          Registrar custo
        </button>
      </header>

      {formAberto && (
        <form
          action={registrarCusto}
          className="mb-6 rounded-2xl border-2 border-brava-yellow/50 bg-brava-yellow/10 p-4"
        >
          <p className="mb-3 text-sm font-black text-brava-ink">Novo custo</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Campo label="Título" hint="ex.: Domínio bravamais.com.br">
              <input name="titulo" required className={inputCls} placeholder="Nome da conta" />
            </Campo>
            <Campo label="Valor (R$)" hint="só o número">
              <input name="valor" required inputMode="decimal" className={inputCls} placeholder="0,00" />
            </Campo>
            <Campo label="Data" hint="quando entrou">
              <input name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
            </Campo>
            <Campo label="Recorrente a partir de" hint="vazio = custo avulso">
              <input name="recorrente" type="month" className={inputCls} />
            </Campo>
          </div>
          <div className="mt-3">
            <Campo label="Observação" hint="opcional">
              <input name="obs" className={inputCls} placeholder="Detalhe que ajude a lembrar do que é" />
            </Campo>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-full bg-brava-black px-4 py-2 text-sm font-bold text-white">
              Salvar custo
            </button>
            <button
              type="button"
              onClick={() => setFormAberto(false)}
              className="rounded-full border border-brava-border bg-brava-card px-4 py-2 text-sm font-bold text-brava-muted"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* KPIs */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi
          icone={<IcoCofre className="h-5 w-5" />}
          label="Total investido"
          valor={brl(totalInvestido)}
          detalhe={`Setup ${setupCents ? brl(setupCents) : "a confirmar"} + desenvolvimento ${brl(devCents)}`}
          destaque
        />
        <Kpi
          icone={<IcoCalendario className="h-5 w-5" />}
          label="Custo mensal"
          valor={brl(custoMensalAtual)}
          detalhe={`${CONTAS_FIXAS.length} contas fixas · câmbio de referência R$ ${CAMBIO.toFixed(2).replace(".", ",")}`}
        />
        <Kpi
          icone={<IcoCodigo className="h-5 w-5" />}
          label={`Mês corrente · ${nomeMes(mesCorrente)}`}
          valor={brl(devMesCents)}
          detalhe={grupoCorrente ? `${grupoCorrente.itens.length} entregas · ${devMesPct}% pago` : "sem desenvolvimento no mês"}
          barra={devMesPct}
        />
      </section>

      {/* Aviso do setup a confirmar */}
      {setupCents === 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <IcoAlerta className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-black">Valor de setup a confirmar com a Diretório Web</p>
            <p className="mt-1">
              O valor contratado do BRAVA+ ainda não foi localizado ({SETUP_ORIGEM}). Até ser informado, o setup
              entra como <strong>R$ 0,00</strong> e não distorce o total investido — que hoje reflete só o
              desenvolvimento pós-entrega.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ---------------- COLUNA ESQUERDA: custos mensais ---------------- */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-brava-ink">
            <IcoCalendario className="h-5 w-5 text-brava-blue" />
            Custos mensais
          </h2>
          <p className="mb-3 text-xs text-brava-muted">
            Contas fixas que mantêm o sistema no ar, mês a mês, desde a entrega da versão 1.
          </p>

          <div className="space-y-3">
            {meses.map((mes) => {
              const linhas = linhasDoMes(mes);
              const total = linhas.reduce((s, l) => s + l.cents, 0);
              const pagoCents = linhas.reduce((s, l) => s + (pago(l.key) ? l.cents : 0), 0);
              const pct = total ? Math.round((pagoCents / total) * 100) : 0;
              const aberto = !!abertos[`mes:${mes}`];
              const keys = linhas.map((l) => l.key);
              const tudoPago = pct === 100;
              return (
                <div key={mes} className="overflow-hidden rounded-2xl border border-brava-border bg-brava-card">
                  <button
                    type="button"
                    onClick={() => toggleAberto(`mes:${mes}`)}
                    className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-brava-paper"
                  >
                    <IcoChevron className={`h-4 w-4 shrink-0 text-brava-muted transition ${aberto ? "rotate-180" : ""}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-black capitalize text-brava-ink">{nomeMes(mes)}</span>
                        {mes === mesCorrente && (
                          <span className="rounded-full bg-brava-blue/10 px-2 py-0.5 text-[10px] font-bold uppercase text-brava-blue">
                            mês corrente
                          </span>
                        )}
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brava-paper">
                        <div
                          className={`h-full rounded-full transition-all ${tudoPago ? "bg-emerald-500" : "bg-brava-yellow"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-brava-muted">{pct}% pago</p>
                    </div>
                    <span className="shrink-0 text-right text-sm font-black text-brava-ink">{brl(total)}</span>
                  </button>

                  {aberto && (
                    <div className="border-t border-brava-border">
                      <ul className="divide-y divide-brava-border">
                        {linhas.map((l) => (
                          <li key={l.key} className="flex items-start gap-3 px-4 py-3">
                            <CheckBotao ativo={pago(l.key)} onClick={() => togglePago(l.key)} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-bold ${pago(l.key) ? "text-brava-muted line-through" : "text-brava-ink"}`}>
                                {l.label}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-brava-muted">
                                <span>{l.obs}</span>
                                {l.usd && <span>· ≈ USD {l.usd}</span>}
                                {l.estimado && (
                                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                                    estimado
                                  </span>
                                )}
                              </p>
                            </div>
                            <ValorEditavel
                              cents={l.cents}
                              editando={editando === l.key}
                              rascunho={rascunho}
                              onEditar={() => {
                                setEditando(l.key);
                                setRascunho((l.cents / 100).toFixed(2).replace(".", ","));
                              }}
                              onRascunho={setRascunho}
                              onSalvar={() => salvarOverride(l.key, rascunho)}
                              onCancelar={() => setEditando(null)}
                              extra={
                                l.extraId ? (
                                  <button
                                    type="button"
                                    onClick={() => removerExtra(l.extraId!)}
                                    title="Remover custo"
                                    className="text-brava-muted transition hover:text-rose-600"
                                  >
                                    <IcoLixeira className="h-3.5 w-3.5" />
                                  </button>
                                ) : null
                              }
                            />
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center justify-between gap-3 border-t border-brava-border bg-brava-paper px-4 py-3">
                        <span className="text-xs text-brava-muted">
                          {brl(pagoCents)} pago de {brl(total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => marcarVarios(keys, !tudoPago)}
                          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                            tudoPago
                              ? "border border-brava-border bg-brava-card text-brava-muted"
                              : "bg-brava-black text-white hover:opacity-90"
                          }`}
                        >
                          {tudoPago ? "Desmarcar mês" : "Marcar mês como pago"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------- COLUNA DIREITA ---------------- */}
        <div className="space-y-4">
          {/* 1. Setup */}
          <Acordeao
            aberto={!!abertos.setup}
            onToggle={() => toggleAberto("setup")}
            icone={<IcoCofre className="h-5 w-5 text-brava-blue" />}
            titulo="Setup inicial (investimento)"
            subtitulo="Valor contratado do projeto — fora do custo mensal"
            direita={setupCents ? brl(setupCents) : "a confirmar"}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
                <IcoCheck className="h-3 w-3" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brava-ink">Entrega da versão 1 do BRAVA+</p>
                <p className="mt-0.5 text-[11px] text-brava-muted">
                  {new Date(`${ENTREGA_V1}T12:00:00`).toLocaleDateString("pt-BR")} · plataforma completa no ar
                  (site, app do assinante, painel do lojista e admin) ·{" "}
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                    pago
                  </span>
                </p>
              </div>
              <ValorEditavel
                cents={setupCents}
                editando={editando === "setup"}
                rascunho={rascunho}
                onEditar={() => {
                  setEditando("setup");
                  setRascunho((setupCents / 100).toFixed(2).replace(".", ","));
                }}
                onRascunho={setRascunho}
                onSalvar={() => salvarOverride("setup", rascunho)}
                onCancelar={() => setEditando(null)}
              />
            </div>
            {setupCents === 0 && (
              <p className="border-t border-brava-border bg-amber-50 px-4 py-3 text-[11px] font-bold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                Valor a confirmar com a Diretório Web — somando R$ 0,00 até ser informado.
              </p>
            )}
          </Acordeao>

          {/* 2. Desenvolvimento pós-entrega */}
          <Acordeao
            aberto={!!abertos.dev}
            onToggle={() => toggleAberto("dev")}
            icone={<IcoCodigo className="h-5 w-5 text-brava-blue" />}
            titulo="Desenvolvimento pós-entrega"
            subtitulo={`${DEV_TOTAL_ITENS} entregas · ${tokensFmt(DEV_TOTAL_TOKENS)} tokens`}
            direita={brl(devCents)}
          >
            <div className="divide-y divide-brava-border">
              {DEV_MESES.map((g) => {
                const totalG = g.itens.reduce((s, it, i) => s + valor(`d:${g.mes}:${i}`, TIERS[it[3]].cents), 0);
                const tokensG = g.itens.reduce((s, it) => s + TIERS[it[3]].tokens, 0);
                const pagoG = g.itens.reduce(
                  (s, it, i) => s + (pago(`d:${g.mes}:${i}`) ? valor(`d:${g.mes}:${i}`, TIERS[it[3]].cents) : 0),
                  0,
                );
                const pctG = totalG ? Math.round((pagoG / totalG) * 100) : 0;
                const keys = g.itens.map((_, i) => `d:${g.mes}:${i}`);
                const tudoPagoG = pctG === 100;
                const abertoG = !!abertos[`dev:${g.mes}`];
                return (
                  <div key={g.key}>
                    <button
                      type="button"
                      onClick={() => toggleAberto(`dev:${g.mes}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brava-paper"
                    >
                      <IcoChevron className={`h-3.5 w-3.5 shrink-0 text-brava-muted transition ${abertoG ? "rotate-180" : ""}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black capitalize text-brava-ink">{nomeMes(g.mes)}</p>
                        <p className="text-[11px] text-brava-muted">
                          {g.key} · {g.itens.length} entregas · {tokensFmt(tokensG)} tokens · {pctG}% pago
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-black text-brava-ink">{brl(totalG)}</span>
                    </button>

                    {abertoG && (
                      <>
                        <ul className="divide-y divide-brava-border border-t border-brava-border">
                          {g.itens.map((it, i) => {
                            const k = `d:${g.mes}:${i}`;
                            const t = TIERS[it[3]];
                            const c = valor(k, t.cents);
                            return (
                              <li key={k} className="flex items-start gap-3 bg-brava-paper/40 px-4 py-3">
                                <CheckBotao ativo={pago(k)} onClick={() => togglePago(k)} />
                                <div className="min-w-0 flex-1">
                                  <p className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-brava-blue/10 px-1.5 py-0.5 text-[10px] font-black text-brava-blue">
                                      {it[0]}
                                    </span>
                                    <span className={`text-sm font-bold ${pago(k) ? "text-brava-muted line-through" : "text-brava-ink"}`}>
                                      {it[1]}
                                    </span>
                                    <TierChip tier={it[3]} />
                                  </p>
                                  <p className="mt-1 text-[11px] leading-relaxed text-brava-muted">{it[2]}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-brava-muted">
                                    {tokensFmt(t.tokens)} tokens
                                  </p>
                                  <ValorEditavel
                                    cents={c}
                                    editando={editando === k}
                                    rascunho={rascunho}
                                    onEditar={() => {
                                      setEditando(k);
                                      setRascunho((c / 100).toFixed(2).replace(".", ","));
                                    }}
                                    onRascunho={setRascunho}
                                    onSalvar={() => salvarOverride(k, rascunho)}
                                    onCancelar={() => setEditando(null)}
                                  />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                        <div className="flex items-center justify-between gap-3 border-t border-brava-border px-4 py-3">
                          <span className="text-xs text-brava-muted">
                            {brl(pagoG)} pago de {brl(totalG)}
                          </span>
                          <button
                            type="button"
                            onClick={() => marcarVarios(keys, !tudoPagoG)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              tudoPagoG
                                ? "border border-brava-border bg-brava-card text-brava-muted"
                                : "bg-brava-black text-white hover:opacity-90"
                            }`}
                          >
                            {tudoPagoG ? "Desmarcar mês" : "Marcar mês como pago"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="border-t border-brava-border bg-brava-paper px-4 py-3 text-[11px] text-brava-muted">
              Cada linha é uma sessão de trabalho. O valor sai do consumo de tokens da sessão (base Opus, câmbio
              R$ {CAMBIO.toFixed(2).replace(".", ",")}): P {tokensFmt(TIERS.P.tokens)} · M {tokensFmt(TIERS.M.tokens)} ·
              G {tokensFmt(TIERS.G.tokens)} · X {tokensFmt(TIERS.X.tokens)}.
            </p>
          </Acordeao>

          {/* 3. APIs & serviços */}
          <Acordeao
            aberto={!!abertos.apis}
            onToggle={() => toggleAberto("apis")}
            icone={<IcoPlug className="h-5 w-5 text-brava-blue" />}
            titulo="APIs e serviços"
            subtitulo="Taxas de quem processa o dinheiro e serviços de apoio"
            direita="informativo"
          >
            <ul className="divide-y divide-brava-border">
              {APIS_SERVICOS.map((a) => (
                <li key={a.nome} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-brava-ink">{a.nome}</p>
                    <p className="mt-0.5 text-[11px] text-brava-muted">{a.obs}</p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-brava-blue">{a.taxa}</span>
                </li>
              ))}
            </ul>
            <p className="border-t border-brava-border bg-brava-paper px-4 py-3 text-[11px] text-brava-muted">
              Estes valores não entram no custo mensal: são descontados por transação, na hora que o dinheiro entra.
            </p>
          </Acordeao>
        </div>
      </div>

      <p className="mt-8 text-[11px] text-brava-muted">
        Marcações de pagamento e ajustes de valor ficam salvos neste navegador. Contas fixas somam{" "}
        <strong className="text-brava-ink">{brl(TOTAL_MENSAL_CENTS)}</strong> por mês e o desenvolvimento
        acumulado soma <strong className="text-brava-ink">{brl(DEV_TOTAL_CENTS)}</strong>.
      </p>
    </div>
  );
}

/* ============================================================================
   Peças
   ========================================================================== */
const inputCls =
  "w-full rounded-xl border border-brava-border bg-brava-card px-3 py-2 text-sm text-brava-ink outline-none focus:border-brava-blue";

function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-brava-muted">
        {label} {hint && <span className="font-normal normal-case tracking-normal opacity-70">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Kpi({
  icone,
  label,
  valor,
  detalhe,
  destaque,
  barra,
}: {
  icone: React.ReactNode;
  label: string;
  valor: string;
  detalhe: string;
  destaque?: boolean;
  barra?: number;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 ${
        destaque ? "border-brava-yellow/50 bg-brava-yellow/10" : "border-brava-border bg-brava-card"
      }`}
    >
      <div className="flex items-center gap-2 text-brava-muted">
        {icone}
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1.5 text-2xl font-black text-brava-ink">{valor}</div>
      {typeof barra === "number" && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brava-paper">
          <div
            className={`h-full rounded-full ${barra === 100 ? "bg-emerald-500" : "bg-brava-yellow"}`}
            style={{ width: `${barra}%` }}
          />
        </div>
      )}
      <p className="mt-1.5 text-[11px] text-brava-muted">{detalhe}</p>
    </div>
  );
}

function Acordeao({
  aberto,
  onToggle,
  icone,
  titulo,
  subtitulo,
  direita,
  children,
}: {
  aberto: boolean;
  onToggle: () => void;
  icone: React.ReactNode;
  titulo: string;
  subtitulo: string;
  direita: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-brava-border bg-brava-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-brava-paper"
      >
        <IcoChevron className={`h-4 w-4 shrink-0 text-brava-muted transition ${aberto ? "rotate-180" : ""}`} />
        {icone}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-brava-ink">{titulo}</p>
          <p className="text-[11px] text-brava-muted">{subtitulo}</p>
        </div>
        <span className="shrink-0 text-sm font-black text-brava-ink">{direita}</span>
      </button>
      {aberto && <div className="border-t border-brava-border">{children}</div>}
    </div>
  );
}

function CheckBotao({ ativo, onClick }: { ativo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      title={ativo ? "Marcado como pago" : "Marcar como pago"}
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
        ativo
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-brava-border bg-brava-card text-transparent hover:border-brava-blue"
      }`}
    >
      <IcoCheck className="h-3 w-3" />
    </button>
  );
}

function TierChip({ tier }: { tier: Tier }) {
  const tone: Record<Tier, string> = {
    P: "bg-zinc-200 text-zinc-700 dark:bg-white/10 dark:text-zinc-300",
    M: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    G: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    X: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  };
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${tone[tier]}`}>
      {TIERS[tier].nome}
    </span>
  );
}

function ValorEditavel({
  cents,
  editando,
  rascunho,
  onEditar,
  onRascunho,
  onSalvar,
  onCancelar,
  extra,
}: {
  cents: number;
  editando: boolean;
  rascunho: string;
  onEditar: () => void;
  onRascunho: (v: string) => void;
  onSalvar: () => void;
  onCancelar: () => void;
  extra?: React.ReactNode;
}) {
  if (editando) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <input
          autoFocus
          value={rascunho}
          inputMode="decimal"
          onChange={(e) => onRascunho(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSalvar();
            if (e.key === "Escape") onCancelar();
          }}
          className="w-24 rounded-lg border border-brava-blue bg-brava-card px-2 py-1 text-right text-sm text-brava-ink outline-none"
        />
        <button type="button" onClick={onSalvar} className="text-emerald-600" title="Salvar">
          <IcoCheck className="h-4 w-4" />
        </button>
      </span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="text-sm font-black text-brava-ink">{brl(cents)}</span>
      <button type="button" onClick={onEditar} title="Ajustar valor" className="text-brava-muted transition hover:text-brava-blue">
        <IcoLapis className="h-3.5 w-3.5" />
      </button>
      {extra}
    </span>
  );
}
