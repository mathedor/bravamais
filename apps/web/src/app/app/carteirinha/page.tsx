import Image from "next/image";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Minha carteirinha" };

export default async function CarteirinhaPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: qr }, { data: sub }] = await Promise.all([
    supabase.from("qr_cards").select("code, issued_at").eq("user_id", profile.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, trial_ends_at")
      .eq("user_id", profile.id)
      .maybeSingle(),
  ]);

  const code = qr?.code ?? "—";
  const qrPayload = `BRAVAMAIS:${code}`;
  const qrSvg = await QRCode.toString(qrPayload, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#0A0A0A", light: "#FBBF24" },
  });

  const tierLabel = sub?.tier ? sub.tier.toUpperCase() : "—";
  const statusLabel = labelStatus(sub?.status);
  const validade = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-brava-ink md:text-4xl">Minha carteirinha</h1>
        <p className="mt-1 text-brava-muted">
          Apresente esse QR no estabelecimento parceiro pra marcar sua visita e acumular vantagens.
        </p>
      </header>

      <article className="overflow-hidden rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue text-white shadow-2xl">
        <div className="flex items-center justify-between px-8 py-6">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={130} height={48} />
          <span className="rounded-full bg-brava-yellow px-3 py-1 text-xs font-bold uppercase tracking-wider text-brava-black">
            {tierLabel}
          </span>
        </div>

        <div className="flex flex-col items-center px-8 pb-8">
          <div
            className="rounded-3xl bg-brava-yellow p-5"
            dangerouslySetInnerHTML={{ __html: qrSvg.replace(/<svg /, '<svg width="240" height="240" ') }}
          />
          <p className="mt-5 font-mono text-sm uppercase tracking-[0.3em] text-brava-yellow">{code}</p>
          <p className="mt-1 text-xl font-bold">{profile.full_name ?? "Assinante"}</p>

          <dl className="mt-6 grid w-full grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm">
            <div>
              <dt className="text-white/60">Status</dt>
              <dd className="font-bold">{statusLabel}</dd>
            </div>
            <div>
              <dt className="text-white/60">Válido até</dt>
              <dd className="font-bold">{validade}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="mt-8 rounded-2xl border border-brava-border bg-white p-5 text-sm text-brava-muted">
        Sua carteirinha é única. Mantenha o app aberto e o brilho da tela alto pro lojista ler o QR rapidinho. Toda
        leitura conta uma visita no clube de fidelidade do estabelecimento.
      </div>
    </div>
  );
}

function labelStatus(s: string | null | undefined): string {
  switch (s) {
    case "trial": return "Trial gratuito";
    case "active": return "Ativa";
    case "past_due": return "Pagamento atrasado";
    case "canceled": return "Cancelada";
    case "paused": return "Pausada";
    default: return "—";
  }
}
