import Link from "next/link";

export const metadata = { title: "Confirme seu email" };

export default function CadastroSucessoPage() {
  return (
    <section className="w-full text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brava-yellow text-brava-blue">
        <span className="text-5xl font-black">+</span>
      </div>
      <h1 className="text-3xl font-black tracking-tight">Quase lá!</h1>
      <p className="mt-3 text-white/70">
        Mandamos um link de confirmação pro seu email. Abra e clique pra ativar sua conta BRAVA+.
      </p>
      <Link
        href="/entrar"
        className="mt-8 inline-flex items-center rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
      >
        Ir pra tela de login
      </Link>
    </section>
  );
}
