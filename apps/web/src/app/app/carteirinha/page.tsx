import Image from "next/image";
import QRCode from "qrcode";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";

export const metadata = { title: "Minha carteirinha" };

export default async function CarteirinhaPage() {
  const { profile } = await requireRole(["subscriber", "admin"]);
  const supabase = await createClient();

  const [{ data: qr }, { data: sub }, { count: visitsTotal }, { count: clubsCount }] = await Promise.all([
    supabase.from("qr_cards").select("code, issued_at").eq("user_id", profile.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("tier, status, current_period_end, trial_ends_at")
      .eq("user_id", profile.id)
      .maybeSingle(),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
    supabase.from("loyalty_progress").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
  ]);

  const code = qr?.code ?? "—";
  const qrSvg = await QRCode.toString(`BRAVAMAIS:${code}`, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#0A0A0A", light: "#FBBF24" },
  });

  const tierLabel = sub?.tier ? sub.tier.toUpperCase() : "—";
  const validade = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6 sm:px-6">
      <header className="mb-4 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brava-blue">Minha carteirinha</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-brava-ink sm:text-3xl">
          Apresente no balcão
        </h1>
      </header>

      <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brava-black via-brava-ink to-brava-blue text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-brava-yellow/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-brava-blue-bright/40 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/10 px-7 py-5">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={110} height={40} />
          <span className="rounded-full bg-brava-yellow px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brava-black">
            {tierLabel}
          </span>
        </div>

        <div className="relative flex flex-col items-center px-6 py-8">
          <div
            className="rounded-2xl bg-brava-yellow p-4 shadow-lg shadow-brava-yellow/20"
            dangerouslySetInnerHTML={{
              __html: qrSvg.replace(/<svg /, '<svg width="220" height="220" '),
            }}
          />
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-brava-yellow">{code}</p>
          <p className="mt-1 text-xl font-black">{profile.full_name ?? "Assinante"}</p>
          <p className="text-xs text-white/60">Válido até {validade}</p>

          <dl className="mt-7 grid w-full grid-cols-2 gap-3 border-t border-white/10 pt-5 text-center text-xs">
            <div>
              <dt className="text-white/55">Visitas totais</dt>
              <dd className="mt-1 text-2xl font-black text-brava-yellow">{visitsTotal ?? 0}</dd>
            </div>
            <div>
              <dt className="text-white/55">Clubes ativos</dt>
              <dd className="mt-1 text-2xl font-black">{clubsCount ?? 0}</dd>
            </div>
          </dl>
        </div>

        <div className="relative border-t border-dashed border-white/15 bg-brava-black/50 px-7 py-3 text-center text-[11px] text-white/55">
          BRAVA+ · Clube de vantagens
        </div>
      </article>

      <div className="mt-6 space-y-3 rounded-3xl border border-brava-border bg-white p-5 text-sm text-brava-muted">
        <p>
          📲 <strong>Como usar:</strong> Mostra o QR pro lojista, ele lê com a câmera e sua visita conta no clube de fidelidade.
        </p>
        <p>
          🔦 <strong>Dica:</strong> Aumenta o brilho da tela em ambientes escuros pro QR ler mais rápido.
        </p>
      </div>

      <Link
        href="/app/fidelidade"
        className="mt-4 flex items-center justify-between rounded-3xl border border-brava-border bg-white p-4 transition hover:border-brava-yellow hover:shadow-md"
      >
        <div>
          <p className="font-bold text-brava-ink">Acompanhar fidelidade</p>
          <p className="text-xs text-brava-muted">Veja em quais clubes você já está</p>
        </div>
        <span className="text-brava-blue">→</span>
      </Link>
    </div>
  );
}
