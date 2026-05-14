import Link from "next/link";
import { ApplyForm } from "./form";

export const metadata = {
  title: "Seja um entregador BRAVA+",
  description: "Faça parte da rede de entregadores BRAVA+. Cadastre-se grátis e seja contratado pelos parceiros da sua região.",
};

const BENEFITS = [
  { emoji: "🚀", title: "Trabalhe quando quiser", body: "Você define a disponibilidade. Sem turno fixo, sem patrão." },
  { emoji: "💵", title: "Ganhos diretos", body: "Receba do estabelecimento contratante, sem taxa BRAVA+ sobre a entrega." },
  { emoji: "📲", title: "App próprio", body: "Mapa com rota otimizada, notificações em tempo real, fluxo simples." },
  { emoji: "⭐", title: "Construa reputação", body: "Avaliações dos clientes melhoram sua visibilidade na rede." },
];

export default function SejaEntregadorPage() {
  return (
    <div className="min-h-screen bg-brava-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brava-yellow/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <Link href="/" className="text-xs text-white/60 hover:underline">
            ← BRAVA+
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-brava-yellow">Entregadores</p>
          <h1 className="mt-3 text-4xl font-black leading-[0.95] sm:text-6xl">
            Seja um entregador<br />
            <span className="bg-gradient-to-r from-brava-yellow to-amber-400 bg-clip-text text-transparent">BRAVA+</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/70 sm:text-lg">
            Cadastre-se grátis e fique disponível pros estabelecimentos parceiros entrarem em contato. A BRAVA+ é a
            ponte; a relação de trabalho é direta com o estabelecimento.
          </p>
          <a
            href="#cadastro"
            className="mt-8 inline-flex rounded-full bg-brava-yellow px-7 py-3 text-sm font-black text-brava-black shadow-xl shadow-brava-yellow/30 hover:scale-[1.02]"
          >
            Quero me cadastrar →
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="text-3xl">{b.emoji}</span>
              <h3 className="mt-3 text-lg font-black">{b.title}</h3>
              <p className="mt-1 text-sm text-white/65">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cadastro" className="border-t border-white/10 bg-brava-black/50">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <h2 className="text-3xl font-black">Cadastro</h2>
          <p className="mt-2 text-sm text-white/65">
            Após enviar, sua candidatura entra em análise pela equipe BRAVA+. Você recebe email quando for aprovado.
          </p>
          <div className="mt-6">
            <ApplyForm />
          </div>
        </div>
      </section>
    </div>
  );
}
