import { createAdminClient } from "@/lib/supabase/admin";

// ============================================================
// Financeiro BRAVA+ — dinâmica de repasse clonada da GYT.
//
// Convenções:
// - Dinheiro sempre em centavos inteiros.
// - Forma do dinheiro: PIX libera em D+2, CARTAO em D+30,
//   contados do paid_at do pedido.
// - Gate de débitos: bloqueios ativos são cobertos primeiro por
//   TODO o dinheiro que ainda está na plataforma (liberado +
//   dentro da janela); só o excedente reduz o disponível de agora.
// ============================================================

export const JANELA_PIX_DIAS = 2;
export const JANELA_CARTAO_DIAS = 30;

export type Forma = "PIX" | "CARTAO";

export interface SaqueLinha {
  forma: Forma;
  total_cents: number; // tudo que o estab faturou nessa forma (não estornado)
  liberado_cents: number; // parcela já fora da janela
  bloqueado_cents: number; // parcela ainda dentro da janela
  sacado_cents: number; // saques pendente+aprovado+pago nessa forma
  restante_cents: number; // liberado - sacado (clamp 0) => sacável antes do gate
  proxima_liberacao: string | null; // ISO da 1ª liberação futura
}

export interface SaqueResumo {
  linhas: SaqueLinha[];
  debitos_cents: number; // bloqueios ativos
  total_disponivel_cents: number; // Σ restante com gate aplicado
  total_bloqueado_cents: number;
  total_solicitado_cents: number; // pendente + aprovado
  total_realizado_cents: number; // pago
  debito_deduzido_cents: number; // quanto os débitos rasparam do disponível
  proxima_liberacao: string | null;
}

function formaDoPedido(paymentMethod: string | null): Forma {
  return paymentMethod === "credit_card" ? "CARTAO" : "PIX";
}

function janelaDias(forma: Forma): number {
  return forma === "CARTAO" ? JANELA_CARTAO_DIAS : JANELA_PIX_DIAS;
}

export function dataLiberacao(paidAt: string, forma: Forma): Date {
  const d = new Date(paidAt);
  d.setDate(d.getDate() + janelaDias(forma));
  return d;
}

/** Soma dos bloqueios financeiros ativos do estabelecimento. */
export async function debitosEstab(establishmentId: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("financial_blocks")
    .select("valor_centavos")
    .eq("establishment_id", establishmentId)
    .eq("status", "ativo");
  return (data ?? []).reduce((s, b) => s + b.valor_centavos, 0);
}

/**
 * Linhas de saque por forma (PIX/CARTAO) + resumo com o gate de débitos.
 * Espelha saqueLinhasEmpresa + o card "Disponível" da GYT:
 *   disponivel = max(0, min(liberadoRestante, sumRestLiquido - debitos))
 */
export async function saqueResumoEstab(establishmentId: string): Promise<SaqueResumo> {
  const admin = createAdminClient();
  const now = new Date();

  const [{ data: orders }, { data: withdrawals }, debitos] = await Promise.all([
    admin
      .from("orders")
      .select("total_cents, status, payment_method, paid_at, created_at")
      .eq("establishment_id", establishmentId)
      .in("status", ["paid", "completed"]),
    admin
      .from("withdrawals")
      .select("amount_cents, status, forma")
      .eq("establishment_id", establishmentId),
    debitosEstab(establishmentId),
  ]);

  const linhasMap = new Map<Forma, SaqueLinha>();
  for (const forma of ["PIX", "CARTAO"] as Forma[]) {
    linhasMap.set(forma, {
      forma,
      total_cents: 0,
      liberado_cents: 0,
      bloqueado_cents: 0,
      sacado_cents: 0,
      restante_cents: 0,
      proxima_liberacao: null,
    });
  }

  for (const o of orders ?? []) {
    const forma = formaDoPedido(o.payment_method);
    const linha = linhasMap.get(forma)!;
    linha.total_cents += o.total_cents;
    const libera = dataLiberacao(o.paid_at ?? o.created_at, forma);
    if (libera <= now) {
      linha.liberado_cents += o.total_cents;
    } else {
      linha.bloqueado_cents += o.total_cents;
      if (!linha.proxima_liberacao || libera.toISOString() < linha.proxima_liberacao) {
        linha.proxima_liberacao = libera.toISOString();
      }
    }
  }

  let solicitado = 0;
  let realizado = 0;
  for (const w of withdrawals ?? []) {
    const forma: Forma = w.forma === "CARTAO" ? "CARTAO" : "PIX";
    if (["pending", "approved", "paid"].includes(w.status)) {
      linhasMap.get(forma)!.sacado_cents += w.amount_cents;
    }
    if (w.status === "pending" || w.status === "approved") solicitado += w.amount_cents;
    if (w.status === "paid") realizado += w.amount_cents;
  }

  const linhas = [...linhasMap.values()];
  // sumRest LÍQUIDO (sem clamp por linha): uma forma "over-sacada"
  // desconta da outra — cobertura é o dinheiro total na plataforma.
  let sumRestLiquido = 0;
  let liberadoRestante = 0;
  for (const l of linhas) {
    sumRestLiquido += l.total_cents - l.sacado_cents;
    l.restante_cents = Math.max(0, l.liberado_cents - l.sacado_cents);
    liberadoRestante += l.restante_cents;
  }

  const tetoAposDebitos = Math.max(0, sumRestLiquido - debitos);
  const disponivel = Math.max(0, Math.min(liberadoRestante, tetoAposDebitos));

  const proximas = linhas.map((l) => l.proxima_liberacao).filter(Boolean) as string[];

  return {
    linhas,
    debitos_cents: debitos,
    total_disponivel_cents: disponivel,
    total_bloqueado_cents: linhas.reduce((s, l) => s + l.bloqueado_cents, 0),
    total_solicitado_cents: solicitado,
    total_realizado_cents: realizado,
    debito_deduzido_cents: Math.max(0, liberadoRestante - disponivel),
    proxima_liberacao: proximas.length ? proximas.sort()[0] : null,
  };
}

/**
 * Quanto o estab pode sacar AGORA numa forma específica (gate aplicado).
 * Retorna também o "sugerido" pra devolver no erro quando estourar.
 */
export async function saquePermitido(
  establishmentId: string,
  forma: Forma,
): Promise<{ permitido: number; restanteLinha: number; debitos: number }> {
  const resumo = await saqueResumoEstab(establishmentId);
  const linha = resumo.linhas.find((l) => l.forma === forma);
  const restanteLinha = linha?.restante_cents ?? 0;
  const sumRestLiquido = resumo.linhas.reduce((s, l) => s + (l.total_cents - l.sacado_cents), 0);
  const permitido = Math.max(0, Math.min(restanteLinha, sumRestLiquido - resumo.debitos_cents));
  return { permitido, restanteLinha, debitos: resumo.debitos_cents };
}

/** Custo de transferência descontado do saque: PIX → syncpay, CARTAO → stripe. */
export async function custoTransferencia(forma: Forma): Promise<number> {
  const admin = createAdminClient();
  const slug = forma === "CARTAO" ? "stripe" : "syncpay";
  const { data } = await admin
    .from("acquirers")
    .select("custo_transferencia_centavos, ativo")
    .eq("slug", slug)
    .maybeSingle();
  if (!data || !data.ativo) return 0;
  return data.custo_transferencia_centavos ?? 0;
}

/**
 * Repasse excedente → bloqueio automático (clone de conferirRepasseExcedente).
 * Se o total pago ao estab superar o devido em > R$0,99, cria/atualiza um
 * bloqueio 'repasse_excedente' com o excesso; auto-resolve se o excesso sumir.
 */
export async function conferirRepasseExcedente(establishmentId: string): Promise<void> {
  const admin = createAdminClient();
  const TOLERANCIA = 99;

  const [{ data: orders }, { data: pagos }, { data: bloco }] = await Promise.all([
    admin
      .from("orders")
      .select("total_cents")
      .eq("establishment_id", establishmentId)
      .in("status", ["paid", "completed"]),
    admin
      .from("withdrawals")
      .select("amount_cents")
      .eq("establishment_id", establishmentId)
      .eq("status", "paid"),
    admin
      .from("financial_blocks")
      .select("id, valor_centavos")
      .eq("establishment_id", establishmentId)
      .eq("razao", "repasse_excedente")
      .eq("status", "ativo")
      .maybeSingle(),
  ]);

  const devido = (orders ?? []).reduce((s, o) => s + o.total_cents, 0);
  const pago = (pagos ?? []).reduce((s, w) => s + w.amount_cents, 0);
  const excesso = pago - devido;

  if (excesso > TOLERANCIA) {
    if (bloco) {
      if (bloco.valor_centavos !== excesso) {
        await admin.from("financial_blocks").update({ valor_centavos: excesso }).eq("id", bloco.id);
      }
    } else {
      await admin.from("financial_blocks").insert({
        establishment_id: establishmentId,
        valor_centavos: excesso,
        razao: "repasse_excedente",
        observacao: "Gerado automaticamente: repasses pagos acima do devido.",
      });
    }
  } else if (bloco) {
    await admin.from("financial_blocks").update({ status: "resolvido" }).eq("id", bloco.id);
  }
}
