import Link from "next/link";

export function PlaybookCards() {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brava-muted">📘 Playbooks de venda — leia antes de bater na rua</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/apresentacao/script-estabelecimento"
          className="group flex items-start gap-4 rounded-2xl border-2 border-brava-yellow/40 bg-gradient-to-br from-brava-yellow/10 to-amber-50 p-5 transition hover:-translate-y-0.5 hover:border-brava-yellow hover:shadow-md"
        >
          <div className="text-4xl">🏪</div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">PLAYBOOK</div>
            <div className="mt-1 text-lg font-black text-brava-ink">Vender pra estabelecimento</div>
            <div className="mt-1 text-xs text-brava-muted">Abertura + discovery + 4 pilares + 8 objeções + fechamento. Script de 3 minutos.</div>
            <div className="mt-3 text-xs font-bold text-brava-blue group-hover:underline">Abrir playbook →</div>
          </div>
        </Link>

        <Link
          href="/apresentacao/script-usuario"
          className="group flex items-start gap-4 rounded-2xl border-2 border-brava-blue/40 bg-gradient-to-br from-brava-blue/5 to-indigo-50 p-5 transition hover:-translate-y-0.5 hover:border-brava-blue hover:shadow-md"
        >
          <div className="text-4xl">👤</div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-brava-blue">PLAYBOOK</div>
            <div className="mt-1 text-lg font-black text-brava-ink">Vender pra pessoa física</div>
            <div className="mt-1 text-xs text-brava-muted">3 canais (WhatsApp, rua, link nu) + 6 objeções + pós-venda dos 7 dias trial.</div>
            <div className="mt-3 text-xs font-bold text-brava-blue group-hover:underline">Abrir playbook →</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
