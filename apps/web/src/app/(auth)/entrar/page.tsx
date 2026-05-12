import Link from "next/link";
import { SignInForm } from "./signin-form";

export const metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <section className="w-full">
      <h1 className="text-4xl font-black tracking-tight">Bem-vindo de volta</h1>
      <p className="mt-2 text-white/70">Entre pra acessar seu clube de vantagens.</p>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
        <SignInForm />
      </div>

      <p className="mt-6 text-center text-sm text-white/60">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-brava-yellow hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </section>
  );
}
