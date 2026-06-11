import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-brava-black px-6 py-12 text-white/70">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-2xl font-black tracking-tight">
            BRAVA<span className="text-brava-yellow">+</span>
          </p>
          <p className="mt-2 max-w-md text-sm">
            Clube de vantagens com cupons, fidelidade, vale-presentes e cashback nos seus parceiros favoritos.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Produto</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/assinar" className="hover:text-brava-yellow">Planos</Link></li>
            <li><Link href="/como-funciona" className="hover:text-brava-yellow">Como funciona</Link></li>
            <li><Link href="/seja-parceiro" className="hover:text-brava-yellow">Seja parceiro</Link></li>
            <li><Link href="/entrar" className="hover:text-brava-yellow">Entrar</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Empresa</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/quem-somos" className="hover:text-brava-yellow">Quem somos</Link></li>
            <li><a href="mailto:contato@bravamais.com.br" className="hover:text-brava-yellow">Contato</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/termos" className="hover:text-brava-yellow">Termos de uso</Link></li>
            <li><Link href="/politica-de-uso" className="hover:text-brava-yellow">Política de uso</Link></li>
            <li><Link href="/lgpd" className="hover:text-brava-yellow">LGPD</Link></li>
            <li><Link href="/privacidade" className="hover:text-brava-yellow">Privacidade</Link></li>
            <li><Link href="/politica-de-pagamento" className="hover:text-brava-yellow">Pagamento</Link></li>
            <li><Link href="/politica-de-reembolso" className="hover:text-brava-yellow">Reembolso e devolução</Link></li>
            <li><Link href="/politica-de-entrega" className="hover:text-brava-yellow">Entrega</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 pt-6 text-xs">
        © {new Date().getFullYear()} BRAVA+ · Todos os direitos reservados
      </div>
    </footer>
  );
}
