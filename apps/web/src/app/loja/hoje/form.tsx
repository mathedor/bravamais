"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createStoryAction } from "./actions";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_cents: number | null;
}

type StickerKind = "none" | "coupon" | "poll";

export function StoryForm({ coupons = [] }: { coupons?: Coupon[] }) {
  const [state, action] = useActionState(createStoryAction, undefined);
  const [sticker, setSticker] = useState<StickerKind>("none");
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
        setSticker("none");
      }}
      className="grid gap-3"
    >
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-brava-ink">URL da imagem</span>
        <input
          name="media_url"
          required
          placeholder="https://… (Unsplash, Imgur, link da sua foto)"
          className={input}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Texto (opcional)</span>
          <input name="caption" placeholder="Ex: Chopp em dobro hoje!" className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brava-ink">Duração (h)</span>
          <select name="ttl_hours" defaultValue="24" className={input}>
            <option value="6">6h</option>
            <option value="12">12h</option>
            <option value="24">24h</option>
            <option value="48">48h</option>
          </select>
        </label>
      </div>

      {/* Sticker picker */}
      <div className="rounded-2xl border border-brava-border bg-brava-paper p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brava-muted">Sticker (opcional)</p>
        <div className="grid grid-cols-3 gap-2">
          {(["none", "coupon", "poll"] as StickerKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSticker(k)}
              className={`rounded-xl border-2 py-2 text-xs font-bold transition ${
                sticker === k ? "border-brava-yellow bg-brava-yellow/15 text-brava-ink" : "border-brava-border bg-brava-card text-brava-muted hover:border-brava-yellow/50"
              }`}
            >
              {k === "none" ? "Nenhum" : k === "coupon" ? "🎁 Cupom" : "🗳️ Enquete"}
            </button>
          ))}
        </div>

        {sticker === "coupon" && (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-medium text-brava-ink">Cupom anexado</span>
            <select name="coupon_id" required className={input}>
              <option value="">Escolher cupom ativo…</option>
              {coupons.map((c) => {
                const desc = c.discount_percent ? `-${c.discount_percent}%` : c.discount_cents ? `R$ ${(c.discount_cents / 100).toFixed(2)}` : "";
                return <option key={c.id} value={c.id}>{c.code} · {desc}</option>;
              })}
            </select>
            {coupons.length === 0 && <p className="mt-1 text-[11px] text-amber-700">Crie um cupom primeiro em /loja/cupons.</p>}
          </label>
        )}

        {sticker === "poll" && (
          <>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-brava-ink">Pergunta</span>
              <input name="poll_question" required placeholder="Ex: Qual sabor de hoje?" className={input} />
            </label>
            <label className="mt-2 block">
              <span className="mb-1 block text-xs font-medium text-brava-ink">Opções (uma por linha · 2 a 4)</span>
              <textarea name="poll_options" required rows={4} placeholder={"Brigadeiro\nMorango\nCenoura"} className={input} />
            </label>
          </>
        )}
      </div>

      {state?.error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">Story publicado!</p>}

      <Submit />
    </form>
  );
}

const input =
  "w-full rounded-xl border border-brava-border bg-brava-card px-4 py-2.5 outline-none focus:border-brava-yellow";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brava-yellow px-6 py-3 text-sm font-bold text-brava-black disabled:opacity-60"
    >
      {pending ? "Publicando…" : "Publicar story"}
    </button>
  );
}
