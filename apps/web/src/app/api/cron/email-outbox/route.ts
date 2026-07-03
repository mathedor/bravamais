import { NextResponse } from "next/server";
import { drainEmailOutbox } from "@/lib/email";

/** Cron horário: drena a fila de emails respeitando o teto diário do Resend. */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await drainEmailOutbox();
  return NextResponse.json({ ok: true, ...result });
}
