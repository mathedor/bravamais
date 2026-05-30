// BRAVA+ — Efí Bank client
//
// 2 modos:
//  - MOCK (default sem EFI_CLIENT_ID/SECRET): gera charges fake com botão
//    "simular pagamento" no UI. Útil pra dev/staging.
//  - REAL: com EFI_CLIENT_ID + EFI_CLIENT_SECRET + EFI_CERT_BASE64 + EFI_PIX_KEY,
//    chama a API real do Efí via fetch.
//
// As funções públicas têm assinatura idêntica em ambos modos.
// Endpoints Efí: https://dev.efipay.com.br/docs/api-pix/
// Webhook: POST /api/efi/webhook (já implementado)

interface EfiCredentials {
  clientId: string;
  clientSecret: string;
  certBase64: string;
  pixKey: string;
  baseUrl: string;
  webhookUrl: string;
}

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

function loadCredentials(): EfiCredentials {
  return {
    clientId: process.env.EFI_CLIENT_ID ?? "",
    clientSecret: process.env.EFI_CLIENT_SECRET ?? "",
    certBase64: process.env.EFI_CERT_BASE64 ?? "",
    pixKey: process.env.EFI_PIX_KEY ?? "",
    baseUrl: process.env.EFI_BASE_URL ?? "https://pix.api.efipay.com.br",
    webhookUrl: process.env.EFI_WEBHOOK_URL ?? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/efi/webhook`,
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEfiAccessToken(creds: EfiCredentials): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const basic = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await fetch(`${creds.baseUrl}/oauth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials" }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Efí token failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function createPixCobReal(amountCents: number, description: string, userId: string, tier: string): Promise<PixCharge> {
  const creds = loadCredentials();
  const token = await getEfiAccessToken(creds);

  const txid = `BR${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}${userId.slice(0, 8).replace(/[^a-z0-9]/gi, "0")}`;
  const body = {
    calendario: { expiracao: 1800 },
    valor: { original: (amountCents / 100).toFixed(2) },
    chave: creds.pixKey,
    solicitacaoPagador: description.slice(0, 140),
    infoAdicionais: [
      { nome: "user_id", valor: userId },
      { nome: "tier", valor: tier },
    ],
  };

  const cobRes = await fetch(`${creds.baseUrl}/v2/cob/${txid}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!cobRes.ok) throw new Error(`Efí PIX failed: ${cobRes.status} ${await cobRes.text()}`);
  const cob = (await cobRes.json()) as { txid: string; loc: { id: number }; pixCopiaECola?: string };

  const qrRes = await fetch(`${creds.baseUrl}/v2/loc/${cob.loc.id}/qrcode`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const qr = (await qrRes.json()) as { qrcode: string; imagemQrcode: string };

  return {
    charge_id: cob.txid,
    qr_code: qr.qrcode,
    qr_code_image_base64: (qr.imagemQrcode ?? "").replace(/^data:image\/png;base64,/, ""),
    copia_e_cola: cob.pixCopiaECola ?? qr.qrcode,
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    is_mock: false,
  };
}

// ============================================================
// PIX
// ============================================================
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
      qr_code_image_base64: "",
      copia_e_cola: `00020126360014BR.GOV.BCB.PIX0114BRAVAMAIS-MOCK52040000530398654040.${args.amountCents.toString().padStart(4, "0")}5802BR5910BRAVAMAIS6009SAO PAULO62${args.tier.length.toString().padStart(2, "0")}${args.tier}6304ABCD`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      is_mock: true,
    };
  }
  return createPixCobReal(args.amountCents, args.description, args.userId, args.tier);
}

export async function chargeCardSubscription(args: {
  userId: string;
  tier: string;
  amountCents: number;
  cardToken: string;
  installments: number;
}): Promise<CardCharge> {
  if (efiIsMock()) {
    const declined = args.cardToken.endsWith("1");
    return {
      charge_id: `mock_card_${Date.now()}_${args.userId.slice(0, 6)}`,
      status: declined ? "declined" : "approved",
      message: declined ? "Cartão recusado (simulação)" : "Aprovado (simulação)",
      is_mock: true,
    };
  }
  throw new Error("Efí cartão real precisa do SDK gn-api-sdk-node. Use PIX por enquanto.");
}

export async function createPixOrder(args: {
  userId: string;
  orderId: string;
  amountCents: number;
  description: string;
}): Promise<PixCharge> {
  if (efiIsMock()) {
    const id = `mock_order_pix_${Date.now()}_${args.orderId.slice(0, 6)}`;
    return {
      charge_id: id,
      qr_code: id,
      qr_code_image_base64: "",
      copia_e_cola: `00020126360014BR.GOV.BCB.PIX0114BRAVAMAIS-MOCK52040000530398654040.${args.amountCents.toString().padStart(4, "0")}5802BR5910BRAVAMAIS6009SAO PAULO6304ABCD`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      is_mock: true,
    };
  }
  return createPixCobReal(args.amountCents, args.description, args.userId, `order_${args.orderId.slice(0, 8)}`);
}

export async function chargeCardOrder(args: {
  userId: string;
  orderId: string;
  amountCents: number;
  cardToken: string;
}): Promise<CardCharge> {
  if (efiIsMock()) {
    const declined = args.cardToken.endsWith("1");
    return {
      charge_id: `mock_order_card_${Date.now()}_${args.orderId.slice(0, 6)}`,
      status: declined ? "declined" : "approved",
      message: declined ? "Cartão recusado (simulação)" : "Aprovado (simulação)",
      is_mock: true,
    };
  }
  throw new Error("Efí cartão real ainda não implementado (use PIX)");
}

// PIX dedicado pra recarga BRAVA Tag
export async function createTagRechargePix(args: {
  userId: string;
  packName: string;
  amountCents: number;
}): Promise<PixCharge> {
  return createPixSubscription({
    userId: args.userId,
    tier: `tag_recharge_${args.packName.replace(/\s+/g, "_")}`,
    amountCents: args.amountCents,
    description: `BRAVA Tag — ${args.packName}`,
  });
}

// ============================================================
// Webhook parser
// ============================================================
export interface EfiWebhookEvent {
  pix: Array<{
    endToEndId: string;
    txid: string;
    valor: string;
    horario: string;
    infoPagador?: string;
  }>;
}

export function parseEfiWebhook(body: string): EfiWebhookEvent | null {
  try {
    return JSON.parse(body) as EfiWebhookEvent;
  } catch {
    return null;
  }
}
