import { requireEstablishment } from "@/lib/establishment-guard";
import { QRScanner } from "./scanner";

export const metadata = { title: "Ler QR" };

export default async function QrScannerPage() {
  await requireEstablishment();

  return (
    <div className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-3xl font-black text-brava-ink">Ler QR</h1>
      <p className="mt-1 text-brava-muted">
        Posicione a carteirinha do cliente na frente da câmera. A visita é registrada na hora.
      </p>

      <div className="mt-6">
        <QRScanner />
      </div>

      <p className="mt-6 rounded-2xl bg-brava-yellow/20 px-4 py-3 text-xs text-brava-ink">
        💡 Permita acesso à câmera no navegador. Em iOS Safari, abra em <code>https://</code> (Vercel cuida disso).
      </p>
    </div>
  );
}
