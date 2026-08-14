import { requireRole } from "@/lib/auth-guard";
import { contasDaAna, comValorDaAna, pagamentosDaAna } from "@/lib/custosAna";
import { CONTAS_FIXAS } from "./data";
import { CustosClient } from "./custos-client";

import PagamentosAna from "./PagamentosAna";
import { marcarPagamentoNaAna } from "./acoes-ana";
export const metadata = { title: "Custos & Desenvolvimento — Admin" };

export default async function CustosPage() {
  const pagamentosNaAna = await pagamentosDaAna("bravamais");
  await requireRole("admin");

  // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura.
  // O relatório trabalha em centavos; o helper, em reais — daí a ida e volta.
  const daAna = await contasDaAna("bravamais");
  const contas = comValorDaAna(
    CONTAS_FIXAS.map((c) => ({ ...c, id: c.slug, nome: c.label, valor: c.cents / 100 })),
    daAna,
  ).map((c) => ({ ...c, cents: Math.round(c.valor * 100), obs: c.obs ?? "" }));

  return (

    <>

      <PagamentosAna inicial={pagamentosNaAna} marcar={marcarPagamentoNaAna} />

      <CustosClient contas={contas} />

    </>

  );
}
