import { requireRole } from "@/lib/auth-guard";
import { contasDaAna, comValorDaAna } from "@/lib/custosAna";
import { CONTAS_FIXAS } from "./data";
import { CustosClient } from "./custos-client";

export const metadata = { title: "Custos & Desenvolvimento — Admin" };

export default async function CustosPage() {
  await requireRole("admin");

  // o preço de verdade da infraestrutura deste mês, lido pela Ana na fatura.
  // O relatório trabalha em centavos; o helper, em reais — daí a ida e volta.
  const daAna = await contasDaAna("bravamais");
  const contas = comValorDaAna(
    CONTAS_FIXAS.map((c) => ({ ...c, id: c.slug, nome: c.label, valor: c.cents / 100 })),
    daAna,
  ).map((c) => ({ ...c, cents: Math.round(c.valor * 100), obs: c.obs ?? "" }));

  return <CustosClient contas={contas} />;
}
