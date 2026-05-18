import Link from "next/link";

export default function ComercialCadastrosHome({
  searchParams,
}: {
  searchParams?: Promise<{ ok?: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <header className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-wider text-brava-blue">cadastros assistidos</div>
        <h1 className="text-2xl font-black tracking-tight">Cadastrar lojista ou assinante</h1>
        <p className="text-sm text-brava-muted">
          Crie a conta direto pelo prospect (cai no seu nome automaticamente) ou mande link pra ele mesmo se cadastrar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/comercial/cadastros/estabelecimento"
          className="rounded-2xl border-2 border-brava-yellow/40 bg-brava-card p-5 transition hover:bg-brava-yellow/5"
        >
          <div className="text-3xl">🏪</div>
          <div className="mt-2 text-lg font-black">Cadastrar lojista</div>
          <div className="text-xs text-brava-muted">Cria conta + estabelecimento. Você vira o comercial responsável.</div>
        </Link>
        <Link
          href="/comercial/cadastros/usuario"
          className="rounded-2xl border-2 border-brava-blue/30 bg-brava-card p-5 transition hover:bg-brava-blue/5"
        >
          <div className="text-3xl">👤</div>
          <div className="mt-2 text-lg font-black">Cadastrar assinante</div>
          <div className="text-xs text-brava-muted">Cria conta no BRAVA+ com trial de 7 dias.</div>
        </Link>
        <Link
          href="/comercial/links"
          className="rounded-2xl border border-dashed border-brava-border bg-brava-card p-5 transition hover:bg-brava-paper sm:col-span-2"
        >
          <div className="text-3xl">🔗</div>
          <div className="mt-2 text-lg font-black">Gerar link de convite</div>
          <div className="text-xs text-brava-muted">Manda o link pro prospect — ele se cadastra sozinho, com tracking.</div>
        </Link>
      </div>
    </div>
  );
}
