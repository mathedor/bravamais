export function LandingStats({ estabs, cupons, cidades }: { estabs: number; cupons: number; cidades: number }) {
  return (
    <section className="border-y border-white/5 bg-brava-black/50 py-12 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={`${estabs}+`} label="Parceiros no clube" />
          <Stat value={`${cupons}+`} label="Cupons ativos" />
          <Stat value={`${cidades}`} label="Cidades atendidas" />
          <Stat value="7d" label="Trial gratuito" highlight />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-4xl font-black tracking-tight sm:text-5xl ${highlight ? "text-brava-yellow" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-white/55">{label}</p>
    </div>
  );
}
