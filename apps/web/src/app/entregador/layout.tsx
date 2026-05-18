import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";
import { OnlineToggle } from "./online-toggle";
import type { Deliverer } from "@/lib/supabase/types";
import { TourMount } from "@/components/onboarding/tour-modal";
import { TourTrigger } from "@/components/onboarding/tour-trigger";
import { ENTREGADOR_TOUR } from "@/components/onboarding/tours-data";
import { PageHelpAuto } from "@/components/onboarding/page-help";

export const metadata = { title: "BRAVA+ Entregador" };

export default async function EntregadorLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("deliverer");
  const supabase = await createClient();
  const [{ data: deliverer }, { data: profileFlags }] = await Promise.all([
    supabase
      .from("deliverers")
      .select("id, is_online, status")
      .eq("user_id", profile.id)
      .maybeSingle<Pick<Deliverer, "id" | "is_online" | "status">>(),
    supabase.from("profiles").select("tutorials_completed").eq("id", profile.id).maybeSingle(),
  ]);

  const approved = deliverer?.status === "approved";
  const tutorialsCompleted = (profileFlags?.tutorials_completed ?? {}) as Record<string, string>;
  const needsTour = !tutorialsCompleted.entregador;

  return (
    <div className="flex min-h-screen flex-col bg-brava-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brava-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link href="/entregador" className="text-lg font-black tracking-tight">
            BRAVA<span className="text-brava-yellow">+</span>
            <span className="ml-2 text-xs font-normal text-white/60">entregador</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {approved && <OnlineToggle isOnline={deliverer.is_online} />}
            <TourTrigger role="entregador" />
            <SignOutButton iconOnly className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10" />
          </div>
        </div>
      </header>
      <PageHelpAuto tourRole="entregador" />
      <main className="flex-1">{children}</main>
      <TourMount role="entregador" steps={ENTREGADOR_TOUR} autoOpen={needsTour} />
    </div>
  );
}
