/* ============================================================================
   BRAVA+ · Custos & Desenvolvimento — MONTAGEM DOS MESES
   O arquivo de dados (data.ts) é escrito à mão e a Ana lê ele cru pelo GitHub;
   por isso ele fica como está e tudo que é "calculado na hora" mora aqui:
   · o mês corrente, no fuso de São Paulo (o servidor da Vercel roda em UTC e
     o navegador de cada um tem o seu — no dia 1º, à meia-noite, quem manda é
     o relógio daqui);
   · o desenvolvimento de cada mês = o que está escrito no arquivo + as tarefas
     que a Ana entregou (mês que ainda não tem grupo escrito nasce aqui);
   · os pedidos pela Ana, que têm fatura própria e ficam fora do mês.
   Função pura: a página usa e o script de conferência usa a mesma.
   ========================================================================== */
import type { EntregaDaAna } from "@/lib/custosAna";
import { DEV_MESES, PRIMEIRO_MES, TIERS, precoTierCents, type DevMes, type Tier } from "./data";

/** "AAAA-MM" de agora no relógio de São Paulo. */
export function mesDeSaoPaulo(agora: Date = new Date()): string {
  try {
    const ym = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).format(agora);
    if (/^\d{4}-\d{2}$/.test(ym)) return ym;
  } catch {
    /* sem base de fuso: cai no relógio da máquina */
  }
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

/** Todos os meses do primeiro com conta até o corrente, mais recente primeiro.
 *  As contas fixas valem todo mês, então o mês novo já nasce com elas no dia 1º. */
export function mesesDoRelatorio(mesCorrente: string, inicio: string = PRIMEIRO_MES): string[] {
  const out: string[] = [];
  let [ano, mes] = inicio.split("-").map(Number);
  for (let guarda = 0; guarda < 600; guarda++) {
    const ym = `${ano}-${String(mes).padStart(2, "0")}`;
    if (ym > mesCorrente) break;
    out.push(ym);
    mes += 1;
    if (mes > 12) {
      mes = 1;
      ano += 1;
    }
  }
  return out.reverse();
}

/** Uma linha do desenvolvimento, venha do arquivo ou da Ana. */
export interface ItemDev {
  /** chave do ✓ e do ajuste de valor (as do arquivo seguem `d:<mês>:<índice>`, como sempre foram) */
  k: string;
  /** "dd/mm" */
  dia: string;
  titulo: string;
  desc: string;
  tier: Tier;
  cents: number;
  tokens: number;
  /** veio da Ana (tarefa do Terminal com commit publicado) */
  ana?: boolean;
}

export interface GrupoDev {
  key: string;
  /** AAAA-MM */
  mes: string;
  itens: ItemDev[];
  /** o mês não está escrito no arquivo: nasceu das tarefas da Ana */
  gerado?: boolean;
}

export interface PedidoDaAna {
  ref: string;
  num: string;
  dia: string;
  titulo: string;
  desc: string;
  quem: string | null;
  cents: number;
  tokensMilhoes: number;
  pago: boolean;
  pagoEm: string | null;
}

export interface GrupoPedidos {
  mes: string;
  itens: PedidoDaAna[];
}

const diaBR = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const diaNum = (ddmm: string) => Number(ddmm.slice(0, 2)) || 0;

/** O desenvolvimento como a página mostra — e como a Ana cobra:
 *  tarefa da Ana pelo mesmo tier (e a mesma margem por competência) que uma
 *  sessão escrita no arquivo, no mês em que ela foi entregue. */
export function montarDesenvolvimento(
  entregas: EntregaDaAna[],
  devMeses: DevMes[] = DEV_MESES,
): { grupos: GrupoDev[]; pedidos: GrupoPedidos[] } {
  const porMes = new Map<string, GrupoDev>();
  const grupos: GrupoDev[] = devMeses.map((g) => {
    const grupo: GrupoDev = {
      key: g.key,
      mes: g.mes,
      itens: g.itens.map(([dia, titulo, desc, tier], i) => ({
        k: `d:${g.mes}:${i}`,
        dia,
        titulo,
        desc,
        tier,
        cents: precoTierCents(g.mes, tier),
        tokens: TIERS[tier].tokens,
      })),
    };
    porMes.set(g.mes, grupo);
    return grupo;
  });

  const pedidosPorMes = new Map<string, GrupoPedidos>();
  const comAna = new Set<GrupoDev>();

  for (const e of entregas) {
    const mes = String(e.dia ?? "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mes)) continue;

    if (e.tipo === "tarefa") {
      let g = porMes.get(mes);
      if (!g) {
        g = { key: `CX_DEV_${mes.slice(5, 7)}`, mes, itens: [], gerado: true };
        porMes.set(mes, g);
        grupos.push(g);
      }
      const tier: Tier = e.tier in TIERS ? e.tier : "P";
      g.itens.push({
        k: `d:${mes}:ana:${e.ref}`,
        dia: diaBR(e.dia),
        titulo: e.titulo,
        desc: e.descricao ?? "",
        tier,
        cents: precoTierCents(mes, tier),
        tokens: TIERS[tier].tokens,
        ana: true,
      });
      comAna.add(g);
    } else if (e.tipo === "pedido") {
      const p = pedidosPorMes.get(mes) ?? { mes, itens: [] };
      pedidosPorMes.set(mes, p);
      p.itens.push({
        ref: e.ref,
        num: String(e.ref).split(":")[1] ?? "",
        dia: diaBR(e.dia),
        titulo: e.titulo,
        desc: e.descricao ?? "",
        quem: e.quem ?? null,
        cents: Math.round(Number(e.valor_centavos ?? 0)),
        tokensMilhoes: Number(e.tokens_milhoes ?? 0),
        pago: Boolean(e.pago),
        pagoEm: e.pago_em ?? null,
      });
    }
  }

  /* com entrega da Ana no meio, o mês fica em ordem de data (mais nova em cima) */
  comAna.forEach((g) => g.itens.sort((a, b) => diaNum(b.dia) - diaNum(a.dia)));
  pedidosPorMes.forEach((p) => p.itens.sort((a, b) => diaNum(b.dia) - diaNum(a.dia)));

  return {
    grupos: grupos.sort((a, b) => b.mes.localeCompare(a.mes)),
    pedidos: [...pedidosPorMes.values()].sort((a, b) => b.mes.localeCompare(a.mes)),
  };
}
