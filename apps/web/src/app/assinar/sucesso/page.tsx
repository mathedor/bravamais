import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Assinatura ativada" };

export default async function SucessoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: sub } = user
    ? await supabase
        .from("subscriptions")
        .select("tier, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="flex min-h-screen flex-col bg-brava-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image src="/logo-dark.svg" alt="BRAVA+" width={120} height={44} priority />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brava-yellow text-brava-black">
            <span className="text-5xl font-black">✓</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Bem-vindo ao BRAVA+!</h1>
          {sub && (
            <p className="mt-3 text-white/75">
              Plano <strong className="text-brava-yellow">{sub.tier.toUpperCase()}</strong> ativo. Válido até{" "}
              {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}.
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
            >
              Ir pro app
            </Link>
            <Link
              href="/app/carteirinha"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium"
            >
              Ver minha carteirinha
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
