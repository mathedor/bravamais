"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProspectStatusAction, deleteProspectAction, updateProspectAction } from "@/app/comercial/actions";

type Prospect = {
  id: string;
  name: string;
  kind: "establishment" | "subscriber";
  status: string;
  source: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  notes: string | null;
  next_action_at: string | null;
  next_action_label: string | null;
  estimated_value_cents: number | null;
  category_slug: string | null;
};

const COLUMNS: { id: string; label: string; tone: string }[] = [
  { id: "novo", label: "Novo", tone: "border-blue-300 bg-blue-50" },
  { id: "contato", label: "Contato", tone: "border-amber-300 bg-amber-50" },
  { id: "visita", label: "Visita", tone: "border-purple-300 bg-purple-50" },
  { id: "proposta", label: "Proposta", tone: "border-fuchsia-300 bg-fuchsia-50" },
  { id: "negociacao", label: "Negociação", tone: "border-yellow-300 bg-yellow-50" },
  { id: "fechado", label: "Fechado ✓", tone: "border-green-300 bg-green-50" },
  { id: "perdido", label: "Perdido", tone: "border-slate-300 bg-slate-100" },
];

export function KanbanBoard({ prospects }: { prospects: Prospect[] }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [dragging, setDragging] = useState<string | null>(null);

  const byCol = (col: string) => prospects.filter((p) => p.status === col);

  const handleDrop = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setDragging(null);
    startTransition(async () => {
      await updateProspectStatusAction(id, col);
      router.refresh();
    });
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max gap-3 pb-4">
        {COLUMNS.map((col) => {
          const items = byCol(col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border-2 ${col.tone} p-2`}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="text-xs font-black uppercase tracking-wider text-brava-ink">{col.label}</div>
                <div className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-brava-ink">{items.length}</div>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {items.map((p) => (
                  <ProspectCard
                    key={p.id}
                    p={p}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", p.id);
                      setDragging(p.id);
                    }}
                    isDragging={dragging === p.id}
                    busy={busy}
                  />
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-brava-muted/40 bg-white/50 p-4 text-center text-[10px] text-brava-muted">
                    arraste aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProspectCard({
  p, onDragStart, isDragging, busy,
}: {
  p: Prospect;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
  busy: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Apagar prospect "${p.name}"?`)) return;
    startTransition(async () => {
      await deleteProspectAction(p.id);
      router.refresh();
    });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`group cursor-move rounded-lg border border-brava-border bg-white p-3 text-xs shadow-sm transition ${isDragging ? "opacity-40" : "hover:shadow-md"}`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="font-bold text-brava-ink">{p.name}</div>
        <div className="flex shrink-0 gap-1">
          {p.kind === "subscriber" ? (
            <span className="rounded bg-brava-blue/10 px-1.5 text-[9px] font-bold uppercase text-brava-blue">User</span>
          ) : (
            <span className="rounded bg-brava-yellow/30 px-1.5 text-[9px] font-bold uppercase text-amber-900">Loja</span>
          )}
        </div>
      </div>
      {p.address && <div className="text-[10px] text-brava-muted">{p.address}</div>}
      {p.next_action_at && (
        <div className="mt-1 rounded bg-brava-yellow/20 px-2 py-1 text-[10px] text-brava-ink">
          📅 {new Date(p.next_action_at).toLocaleDateString("pt-BR")} · {p.next_action_label ?? "ação"}
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="mt-2 text-[10px] text-brava-blue hover:underline"
      >
        {expanded ? "esconder" : "detalhes"}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-brava-border pt-2">
          {p.contact_name && <div>👤 {p.contact_name}</div>}
          {p.phone && <div>📞 <a href={`tel:${p.phone}`} className="text-brava-blue">{p.phone}</a></div>}
          {p.email && <div>✉️ <a href={`mailto:${p.email}`} className="text-brava-blue">{p.email}</a></div>}
          {p.estimated_value_cents && (
            <div className="text-brava-muted">💰 Ticket est: R$ {(p.estimated_value_cents / 100).toFixed(2)}</div>
          )}
          {p.notes && <div className="rounded bg-brava-paper p-1.5 text-[10px] italic">{p.notes}</div>}
          <div className="flex flex-wrap gap-1 pt-1">
            {p.status === "fechado" ? (
              p.kind === "establishment" ? (
                <Link
                  href={`/comercial/cadastros/estabelecimento?prospect=${p.id}&name=${encodeURIComponent(p.name)}`}
                  className="rounded bg-brava-blue px-2 py-1 text-[10px] font-bold text-white"
                >
                  Cadastrar lojista
                </Link>
              ) : (
                <Link
                  href={`/comercial/cadastros/usuario?prospect=${p.id}&name=${encodeURIComponent(p.name)}`}
                  className="rounded bg-brava-blue px-2 py-1 text-[10px] font-bold text-white"
                >
                  Cadastrar assinante
                </Link>
              )
            ) : null}
            <Link
              href={`/comercial/links?prospect=${p.id}`}
              className="rounded border border-brava-border bg-brava-paper px-2 py-1 text-[10px] font-bold text-brava-ink"
            >
              Gerar link
            </Link>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-brava-border bg-brava-paper px-2 py-1 text-[10px] font-bold text-brava-ink"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      {editing && <ProspectEditModal p={p} onClose={() => setEditing(false)} />}
    </div>
  );
}

function ProspectEditModal({ p, onClose }: { p: Prospect; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save(fd: FormData) {
    fd.set("id", p.id);
    startTransition(async () => {
      const res = await updateProspectAction(undefined, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-brava-border bg-white px-2.5 py-1.5 text-xs outline-none focus:border-brava-blue";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <form
        action={save}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 text-xs sm:rounded-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-brava-ink">Editar prospect</h3>
          <button type="button" onClick={onClose} className="text-xl leading-none text-brava-muted">×</button>
        </div>

        <label className="block font-bold text-brava-ink">Nome
          <input name="name" defaultValue={p.name} required className={inputCls} />
        </label>
        <label className="mt-2 block font-bold text-brava-ink">Contato
          <input name="contact_name" defaultValue={p.contact_name ?? ""} className={inputCls} />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block font-bold text-brava-ink">Telefone
            <input name="phone" defaultValue={p.phone ?? ""} className={inputCls} />
          </label>
          <label className="block font-bold text-brava-ink">E-mail
            <input name="email" defaultValue={p.email ?? ""} className={inputCls} />
          </label>
        </div>
        <label className="mt-2 block font-bold text-brava-ink">Status
          <select name="status" defaultValue={p.status} className={inputCls}>
            {COLUMNS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
        <label className="mt-2 block font-bold text-brava-ink">Ticket estimado (R$)
          <input
            name="estimated_value_cents"
            defaultValue={p.estimated_value_cents ? (p.estimated_value_cents / 100).toFixed(2) : ""}
            placeholder="0,00"
            className={inputCls}
          />
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block font-bold text-brava-ink">Próxima ação
            <input name="next_action_label" defaultValue={p.next_action_label ?? ""} placeholder="Ligar, visitar..." className={inputCls} />
          </label>
          <label className="block font-bold text-brava-ink">Data
            <input
              type="date"
              name="next_action_at"
              defaultValue={p.next_action_at ? p.next_action_at.slice(0, 10) : ""}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-2 block font-bold text-brava-ink">Notas
          <textarea name="notes" defaultValue={p.notes ?? ""} rows={3} className={inputCls} />
        </label>

        {error && <p className="mt-2 rounded bg-red-50 px-2 py-1 text-red-700">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-brava-border bg-brava-paper py-2 font-bold text-brava-ink">
            Cancelar
          </button>
          <button type="submit" disabled={pending} className="flex-[2] rounded-full bg-brava-blue py-2 font-bold text-white disabled:opacity-60">
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
