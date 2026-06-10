import { Suspense } from "react";
import { ReturnPoller } from "./poller";

// Página de retorno do Stripe (return_url do confirmPayment).
// Lê ?pid=<payment_id>&next=<successUrl>, confirma via polling e redireciona.
export default async function PagamentoRetornoPage({
  searchParams,
}: {
  searchParams: Promise<{ pid?: string; next?: string; redirect_status?: string }>;
}) {
  const sp = await searchParams;
  const pid = sp.pid ?? "";
  const next = sp.next ?? "/app";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        {pid ? (
          <Suspense fallback={null}>
            <ReturnPoller paymentId={pid} next={next} />
          </Suspense>
        ) : (
          <p className="text-sm text-brava-muted">Pagamento não identificado.</p>
        )}
      </div>
    </main>
  );
}
