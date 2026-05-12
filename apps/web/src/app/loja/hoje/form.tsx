"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createStoryAction } from "./actions";

export function StoryForm() {
  const [state, action] = useActionState(createStoryAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
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
