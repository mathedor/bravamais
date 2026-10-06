import { requireRole } from "@/lib/auth-guard";
import { contasDaAna, comValorDaAna, entregasDaAna, pagamentosDaAna } from "@/lib/custosAna";
import { CONTAS_FIXAS } from "./data";
import { CustosClient } from "./custos-client";
import { mesDeSaoPaulo, montarDesenvolvimento } from "./montagem";

import PagamentosAna, { SaldosDaAna } from "./PagamentosAna";
import { marcarPagamentoNaAna } from "./acoes-ana";
export const metadata = { title: "Custos & Desenvolvimento — Admin" };

export default async function CustosPage() {
  await requireRole("admin");

  const [pagamentosNaAna, daAna, entregas] = await Promise.all([
    pagamentosDaAna("bravamais"),
    // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura
    contasDaAna("bravamais"),
    // o que a Ana entregou aqui (tarefas entram no mês, pedidos ficam à parte)
    entregasDaAna("bravamais"),
  ]);

  // O relatório trabalha em centavos; o helper, em reais — daí a ida e volta.
  const contas = comValorDaAna(
    CONTAS_FIXAS.map((c) => ({ ...c, id: c.slug, nome: c.label, valor: c.cents / 100 })),
    daAna,
  ).map((c) => ({ ...c, cents: Math.round(c.valor * 100), obs: c.obs ?? "" }));

  // o mês corrente vem daqui (relógio de São Paulo), não do navegador: no dia
  // 1º o mês novo já aparece com as contas, sem ninguém editar o arquivo
  const mesCorrente = mesDeSaoPaulo();
  const { grupos, pedidos } = montarDesenvolvimento(entregas);

  return (

    // os saldos (mês pago que mudou depois) valem pros dois quadros: a baixa
    // dada no quadro de pagamentos redesenha a linha de saldo no relatório
    <SaldosDaAna inicial={pagamentosNaAna.saldos}>

      <PagamentosAna inicial={pagamentosNaAna} marcar={marcarPagamentoNaAna} />

      <CustosClient contas={contas} mesCorrente={mesCorrente} grupos={grupos} pedidos={pedidos} saldos={pagamentosNaAna.saldos} />

    </SaldosDaAna>

  );
}
