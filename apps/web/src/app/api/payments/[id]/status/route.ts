import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncPaymentStatus } from "@/lib/payments";

/**
 * Polling de status de um pagamento. O front bate aqui a cada ~3s.
 * Consulta o gateway e confirma (idempotente) se já pagou — backup do webhook.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const status = await syncPaymentStatus(id, user.id);
  return NextResponse.json(
    { status, paid: status === "paid" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
