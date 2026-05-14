import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth-guard";
import type { UserAddress } from "@/lib/supabase/types";
import { AddressForm } from "./form";
import { deleteAddressAction, setDefaultAddressAction } from "./actions";

export const metadata = { title: "Meus endereços" };

export default async function EnderecosPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const { data: addresses } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", profile.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brava-ink">Meus endereços</h1>
          <p className="text-sm text-brava-muted">Pra receber pedidos em casa, no trabalho ou onde você quiser.</p>
        </div>
        <Link href="/app/perfil" className="text-sm text-brava-blue hover:underline">
          ← Perfil
        </Link>
      </header>

      <section className="rounded-3xl border border-brava-border bg-brava-card p-5">
        <h2 className="mb-3 text-base font-bold text-brava-ink">Adicionar novo</h2>
        <AddressForm />
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-bold text-brava-ink">
          Salvos ({(addresses as UserAddress[] | null)?.length ?? 0})
        </h2>
        {(addresses as UserAddress[] | null)?.length ? (
          (addresses as UserAddress[]).map((a) => (
            <article key={a.id} className="rounded-2xl border border-brava-border bg-brava-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-brava-ink">
                    {a.label}
                    {a.is_default && (
                      <span className="rounded-full bg-brava-yellow/20 px-2 py-0.5 text-[10px] font-bold text-brava-blue">
                        PADRÃO
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-brava-muted">
                    {a.street}
                    {a.number ? `, ${a.number}` : ""}
                    {a.complement ? ` — ${a.complement}` : ""}
                  </p>
                  <p className="text-sm text-brava-muted">
                    {a.neighborhood ? `${a.neighborhood} · ` : ""}
                    {a.city} / {a.state} · CEP {a.cep}
                  </p>
                  {a.reference && <p className="mt-1 text-xs text-brava-muted">📍 {a.reference}</p>}
                </div>
              </div>
              <div className="mt-3 flex gap-3 text-xs">
                {!a.is_default && (
                  <form action={setDefaultAddressAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="font-bold text-brava-blue hover:underline">tornar padrão</button>
                  </form>
                )}
                <form action={deleteAddressAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="font-bold text-red-600 hover:underline">excluir</button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-brava-border bg-brava-card p-8 text-center text-sm text-brava-muted">
            Você ainda não cadastrou nenhum endereço. Adicione o primeiro acima.
          </p>
        )}
      </section>
    </div>
  );
}
