"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProspectStatusAction, deleteProspectAction } from "@/app/comercial/actions";

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
              onClick={handleDelete}
              disabled={pending}
              className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
