import Link from "next/link";
import { SignUpForm } from "./signup-form";

export const metadata = { title: "Criar conta" };

export default function CadastroPage() {
  return (
    <section className="w-full">
      <h1 className="text-4xl font-black tracking-tight">Crie sua conta BRAVA+</h1>
      <p className="mt-2 text-white/70">
        Você ganha 7 dias grátis para testar os benefícios do clube.
      </p>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
        <SignUpForm />
      </div>

      <p className="mt-6 text-center text-sm text-white/60">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-brava-yellow hover:underline">
          Entrar
        </Link>
      </p>
    </section>
  );
}
