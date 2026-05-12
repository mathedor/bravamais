// BRAVA+ — Efí Bank client (mock mode until credenciais reais chegarem)

export interface PixCharge {
  charge_id: string;
  qr_code: string;
  qr_code_image_base64: string;
  copia_e_cola: string;
  expires_at: string;
  is_mock: boolean;
}

export interface CardCharge {
  charge_id: string;
  status: "approved" | "declined";
  message?: string;
  is_mock: boolean;
}

export function efiIsMock(): boolean {
  return !process.env.EFI_CLIENT_ID || !process.env.EFI_CLIENT_SECRET;
}

export async function createPixSubscription(args: {
  userId: string;
  tier: string;
  amountCents: number;
  description: string;
}): Promise<PixCharge> {
  if (efiIsMock()) {
    const id = `mock_pix_${Date.now()}_${args.userId.slice(0, 6)}`;
    return {
      charge_id: id,
      qr_code: id,
      qr_code_image_base64: "", // empty — UI mostra placeholder + botão simular
      copia_e_cola: `00020126360014BR.GOV.BCB.PIX0114BRAVAMAIS-MOCK52040000530398654040.${args.amountCents.toString().padStart(4, "0")}5802BR5910BRAVAMAIS6009SAO PAULO62${args.tier.length.toString().padStart(2, "0")}${args.tier}6304ABCD`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      is_mock: true,
    };
  }
  // TODO: integração Efí real
  throw new Error("Efí real ainda não implementado — adicionar credenciais e SDK");
}

export async function chargeCardSubscription(args: {
  userId: string;
  tier: string;
  amountCents: number;
  cardToken: string;
  installments: number;
}): Promise<CardCharge> {
  if (efiIsMock()) {
    // simulação: tokens terminando em "1" falham
    const declined = args.cardToken.endsWith("1");
    return {
      charge_id: `mock_card_${Date.now()}_${args.userId.slice(0, 6)}`,
      status: declined ? "declined" : "approved",
      message: declined ? "Cartão recusado (simulação)" : "Aprovado (simulação)",
      is_mock: true,
    };
  }
  throw new Error("Efí real ainda não implementado");
}
