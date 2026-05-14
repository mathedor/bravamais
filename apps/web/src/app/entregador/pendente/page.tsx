import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";
import type { Deliverer } from "@/lib/supabase/types";

export const metadata = { title: "Cadastro em análise" };

const MESSAGES: Record<string, { title: string; body: string }> = {
  pending_review: {
    title: "Seu cadastro está em análise",
    body: "A equipe BRAVA+ está verificando seus dados e documentos. Você receberá um email assim que for aprovado.",
  },
  rejected: {
    title: "Cadastro não aprovado",
    body: "Infelizmente seu cadastro não foi aprovado. Entre em contato com a equipe pra entender os motivos.",
  },
  suspended: {
    title: "Conta suspensa",
    body: "Sua conta está suspensa. Entre em contato com a equipe BRAVA+ pra mais informações.",
  },
  inactive: {
    title: "Conta inativa",
    body: "Sua conta está inativa. Entre em contato com a equipe pra reativar.",
  },
};

export default async function PendentePage() {
  const { profile } = await requireRole("deliverer");
  const supabase = await createClient();
  const { data: deliverer } = await supabase
    .from("deliverers")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle<Deliverer>();

  const meta = MESSAGES[deliverer?.status ?? "pending_review"] ?? MESSAGES.pending_review;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brava-black px-6 text-center text-white">
      <span className="text-5xl">⏳</span>
      <h1 className="mt-6 text-3xl font-black">{meta.title}</h1>
      <p className="mt-3 max-w-md text-base text-white/70">{meta.body}</p>

      {deliverer?.status === "rejected" && deliverer.rejection_reason && (
        <p className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          <span className="font-bold">Motivo:</span> {deliverer.rejection_reason}
        </p>
      )}

      <a
        href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20sou%20entregador%20do%20BRAVA%2B%20e%20preciso%20de%20ajuda"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black"
      >
        📲 Falar com a equipe BRAVA+
      </a>

      <SignOutButton className="mt-4 text-sm text-white/50 hover:underline" />
    </div>
  );
}
