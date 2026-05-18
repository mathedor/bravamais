import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignUpForm } from "./signup-form";

export const metadata = { title: "Criar conta" };

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const refRaw = (ref ?? "").trim();
  const refClean = refRaw.toUpperCase();
  // Detecta se é ref de comercial (COM-XXXX ou token 32 chars)
  const isCommercial = refClean.startsWith("COM-") || refRaw.length === 32;
  let commercialName: string | null = null;
  if (isCommercial) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("resolve_commercial_ref", { p_ref: refRaw });
    if (data?.[0]) commercialName = data[0].affiliate_name;
  }

  return (
    <section className="w-full">
      <h1 className="text-4xl font-black tracking-tight">Crie sua conta BRAVA+</h1>
      <p className="mt-2 text-white/70">
        Você ganha 7 dias grátis para testar os benefícios do clube.
      </p>

      {refClean && (
        <div className="mt-6 rounded-2xl border border-brava-yellow/40 bg-brava-yellow/10 p-4 text-sm text-brava-yellow">
          {isCommercial && commercialName ? (
            <>🤝 Você foi indicado por <strong>{commercialName}</strong>. Seu cadastro será vinculado ao comercial responsável.</>
          ) : (
            <>🎁 Você foi indicado com o código <strong className="font-mono">{refClean}</strong>. Ganhe 50 BRAVA Coins ao assinar.</>
          )}
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
        <SignUpForm referralCode={isCommercial ? refRaw : refClean} />
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
