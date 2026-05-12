export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

export const PROMO_LABELS: Record<string, string> = {
  cupom_desconto: "Cupom de desconto",
  vale_presente: "Vale-presente",
  vale_compras: "Vale-compras",
  clube_fidelidade: "Clube de fidelidade",
  cashback: "Cashback",
};
