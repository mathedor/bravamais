// BRAVA+ — SyncPay client (PIX cash-in)
//
// 2 modos:
//  - MOCK (sem SYNCPAY_CLIENT_ID/SECRET): gera um copia-e-cola fake. O endpoint
//    de status devolve "paid" automaticamente após alguns segundos (dev/staging).
//  - REAL: OAuth2 client_credentials → /api/partner/v1/cash-in.
//
// Docs: https://syncpay.apidog.io/   Base: https://api.syncpayments.com.br
// Espelha o SyncPayClient.php do GYT.
import QRCode from "qrcode";

const API = "https://api.syncpayments.com.br";

export interface SyncPixCharge {
  identifier: string;        // id da transação na SyncPay
  pixCode: string;           // copia e cola
  qrBase64: string;          // PNG do QR em base64 (sem prefixo data:)
  expiresAt: string;         // ISO
  isMock: boolean;
  raw: unknown;
}

export type SyncStatus = "paid" | "pending" | "failed" | "refunded";

export interface SyncPayer {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

const PIX_TIMEOUT_MIN = 30;

export function syncpayIsMock(): boolean {
  return !process.env.SYNCPAY_CLIENT_ID || !process.env.SYNCPAY_CLIENT_SECRET;
}

function webhookUrl(): string {
  return (
    process.env.SYNCPAY_WEBHOOK_URL ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/syncpay/webhook`
  );
}

// ---------- token (cache em memória, margem de 60s) ----------
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const res = await fetch(`${API}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.SYNCPAY_CLIENT_ID,
      client_secret: process.env.SYNCPAY_CLIENT_SECRET,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!res.ok || !json.access_token) {
    throw new Error(`SyncPay auth falhou: ${res.status} ${JSON.stringify(json)}`);
  }
  const expires = json.expires_in ?? 3600;
  cachedToken = { token: json.access_token, expiresAt: Date.now() + expires * 1000 };
  return json.access_token;
}

async function call(method: string, path: string, body?: unknown): Promise<Record<string, unknown>> {
  const token = await getToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg = (json.message as string) ?? `HTTP ${res.status}`;
    throw new Error(`SyncPay ${res.status}: ${msg}`);
  }
  return json;
}

async function qrPng(payload: string): Promise<string> {
  if (!payload) return "";
  try {
    const dataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 400 });
    return dataUrl.replace(/^data:image\/png;base64,/, "");
  } catch {
    return "";
  }
}

// ============================================================
// Criar cobrança PIX (cash-in)
// ============================================================
export async function createPixCharge(args: {
  amountCents: number;
  description: string;
  payer: SyncPayer;
  externalRef?: string;
}): Promise<SyncPixCharge> {
  const expiresAt = new Date(Date.now() + PIX_TIMEOUT_MIN * 60_000).toISOString();

  if (syncpayIsMock()) {
    const id = `mock_${args.externalRef ?? "pix"}_${Date.now()}`;
    const fake = `00020126360014BR.GOV.BCB.PIX0114BRAVAMAIS-MOCK520400005303986540${(args.amountCents / 100)
      .toFixed(2)
      .padStart(6, "0")}5802BR5910BRAVAMAIS6009SAO PAULO62070503***6304MOCK`;
    return {
      identifier: id,
      pixCode: fake,
      qrBase64: await qrPng(fake),
      expiresAt,
      isMock: true,
      raw: { mock: true },
    };
  }

  const valor = Math.round(args.amountCents) / 100;
  const cpf = args.payer.cpf.replace(/\D/g, "") || "00000000000";
  const phone = args.payer.phone.replace(/\D/g, "") || "11999999999";

  const resp = await call("POST", "/api/partner/v1/cash-in", {
    amount: valor,
    description: args.description.slice(0, 250),
    webhook_url: webhookUrl(),
    client: {
      name: (args.payer.name || "Cliente BRAVA+").slice(0, 100),
      cpf,
      email: args.payer.email || "cliente@bravamais.com.br",
      phone,
    },
  });

  const pixCode = String(resp.pix_code ?? "");
  const identifier = String(resp.identifier ?? "");
  if (!pixCode || !identifier) {
    throw new Error(`SyncPay cash-in sem pix_code/identifier: ${JSON.stringify(resp)}`);
  }

  return {
    identifier,
    pixCode,
    qrBase64: await qrPng(pixCode),
    expiresAt,
    isMock: false,
    raw: resp,
  };
}

// ============================================================
// Consultar status de uma transação
// ============================================================
export async function consultar(identifier: string): Promise<{ status: SyncStatus; raw: unknown }> {
  if (identifier.startsWith("mock_")) {
    // mock: "pago" depois de ~6s da criação (o timestamp está no id)
    const ts = Number(identifier.split("_").pop() ?? "0");
    const paid = ts > 0 && Date.now() - ts > 6_000;
    return { status: paid ? "paid" : "pending", raw: { mock: true } };
  }

  const resp = await call("GET", `/api/partner/v1/transaction/${encodeURIComponent(identifier)}`);
  const data = (resp.data ?? resp) as Record<string, unknown>;
  const s = String(data.status ?? "pending");
  const status: SyncStatus =
    s === "completed" || s === "approved"
      ? "paid"
      : s === "failed"
        ? "failed"
        : s === "refunded"
          ? "refunded"
          : "pending";
  return { status, raw: resp };
}

// ============================================================
// Webhook parser — SyncPay manda { identifier, status, ... }
// ============================================================
export interface SyncWebhookEvent {
  identifier: string;
  status: string;
}

export function parseSyncWebhook(body: string): SyncWebhookEvent | null {
  try {
    const j = JSON.parse(body) as Record<string, unknown>;
    const data = (j.data ?? j) as Record<string, unknown>;
    const identifier = String(j.identifier ?? data.identifier ?? data.reference_id ?? "");
    const status = String(j.status ?? data.status ?? "");
    if (!identifier) return null;
    return { identifier, status };
  } catch {
    return null;
  }
}
