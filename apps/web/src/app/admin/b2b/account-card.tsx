"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateB2BAccountAction,
  toggleB2BAccountAction,
  inviteB2BEmailsAction,
  revokeB2BInviteAction,
} from "./actions";

export interface AccountWithInvites {
  id: string;
  company_name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_email: string | null;
  seats_purchased: number;
  seats_used: number;
  monthly_cents_per_seat: number;
  active: boolean;
  invites: {
    id: string;
    email: string;
    accepted_at: string | null;
    expires_at: string;
    created_at: string;
  }[];
}

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Btn({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-full px-4 py-2 text-xs font-black disabled:opacity-60 ${className ?? "bg-brava-black text-brava-yellow"}`}
    >
      {pending ? "…" : children}
    </button>
  );
}

export function B2BAccountCard({ account }: { account: AccountWithInvites }) {
  const [open, setOpen] = useState(false);
  const [inviteState, inviteAction] = useActionState(inviteB2BEmailsAction, undefined);
  const [editState, editAction] = useActionState(updateB2BAccountAction, undefined);

  const now = Date.now();
  const pending = account.invites.filter((i) => !i.accepted_at && new Date(i.expires_at).getTime() > now);
  const accepted = account.invites.filter((i) => i.accepted_at);
  const expired = account.invites.filter((i) => !i.accepted_at && new Date(i.expires_at).getTime() <= now);

  return (
    <article className="rounded-2xl border border-brava-border bg-brava-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-brava-ink">
            🏢 {account.company_name}
            {account.active ? null : (
              <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700">inativa</span>
            )}
          </p>
          <p className="text-[11px] text-brava-muted">
            {account.cnpj && `CNPJ ${account.cnpj} · `}
            {account.contact_name ?? "—"} · {account.contact_email ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <p className="font-bold text-brava-blue">
              {account.seats_used}/{account.seats_purchased} seats
            </p>
            <p className="text-[11px] font-bold text-brava-ink">
              {fmtBRL(account.seats_used * account.monthly_cents_per_seat)}/mês
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full border border-brava-border px-3 py-1.5 text-xs font-bold text-brava-ink"
          >
            {open ? "Fechar" : "Gerenciar"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-brava-border pt-4">
          {/* Convites */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brava-muted">
              Convidar funcionários ({pending.length} pendente{pending.length === 1 ? "" : "s"} ·{" "}
              {accepted.length} ativo{accepted.length === 1 ? "" : "s"})
            </h3>
            <form action={inviteAction} className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="account_id" value={account.id} />
              <textarea
                name="emails"
                rows={2}
                placeholder="emails separados por vírgula, espaço ou linha"
                className="flex-1 rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
              />
              <Btn>✉️ Convidar</Btn>
            </form>
            {inviteState?.error && <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{inviteState.error}</p>}
            {inviteState?.ok && <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{inviteState.ok}</p>}

            {account.invites.length > 0 && (
              <ul className="mt-3 space-y-1">
                {[...accepted, ...pending, ...expired].map((i) => {
                  const isExpired = !i.accepted_at && new Date(i.expires_at).getTime() <= now;
                  return (
                    <li key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-brava-paper px-3 py-2 text-xs">
                      <span className="truncate text-brava-ink">{i.email}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {i.accepted_at ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">ativo</span>
                        ) : isExpired ? (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600">expirado</span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">pendente</span>
                        )}
                        {!i.accepted_at && (
                          <form action={revokeB2BInviteAction}>
                            <input type="hidden" name="invite_id" value={i.id} />
                            <button type="submit" className="text-[10px] font-bold text-rose-600 hover:underline">
                              revogar
                            </button>
                          </form>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Editar */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brava-muted">Editar contrato</h3>
            <form action={editAction} className="mt-2 flex flex-wrap items-end gap-2">
              <input type="hidden" name="account_id" value={account.id} />
              <label className="block">
                <span className="text-[10px] font-bold uppercase text-brava-muted">Seats</span>
                <input
                  name="seats"
                  type="number"
                  min={1}
                  defaultValue={account.seats_purchased}
                  className="mt-1 w-24 rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase text-brava-muted">R$/seat/mês</span>
                <input
                  name="reais_per_seat"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={account.monthly_cents_per_seat / 100}
                  className="mt-1 w-28 rounded-xl border border-brava-border bg-brava-paper px-3 py-2 text-sm outline-none"
                />
              </label>
              <Btn>Salvar</Btn>
              {editState?.error && <span className="text-xs text-rose-600">{editState.error}</span>}
              {editState?.ok && <span className="text-xs text-emerald-600">{editState.ok}</span>}
            </form>
          </div>

          {/* Ativar/desativar */}
          <form action={toggleB2BAccountAction}>
            <input type="hidden" name="account_id" value={account.id} />
            <input type="hidden" name="active" value={account.active ? "false" : "true"} />
            <Btn className={account.active ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>
              {account.active ? "⏸ Desativar conta" : "▶️ Reativar conta"}
            </Btn>
          </form>
        </div>
      )}
    </article>
  );
}
