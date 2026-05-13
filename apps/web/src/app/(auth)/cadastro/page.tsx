import Link from "next/link";
import { SignUpForm } from "./signup-form";

export const metadata = { title: "Criar conta" };

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const refClean = (ref ?? "").trim().toUpperCase();

  return (
    <section className="w-full">
      <h1 className="text-4xl font-black tracking-tight">Crie sua conta BRAVA+</h1>
      <p className="mt-2 text-white/70">
        Você ganha 7 dias grátis para testar os benefícios do clube.
      </p>

      {refClean && (
        <div className="mt-6 rounded-2xl border border-brava-yellow/40 bg-brava-yellow/10 p-4 text-sm text-brava-yellow">
          🎁 Você foi indicado com o código <strong className="font-mono">{refClean}</strong>. Ganhe 50 BRAVA Coins ao assinar.
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
        <SignUpForm referralCode={refClean} />
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
