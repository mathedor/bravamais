"use client";

import { useState, useTransition } from "react";
import { sendRetentionPushAction } from "./actions";

export function ReactivateForm({ userId, userName }: { userId: string; userName: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function fire() {
    const fd = new FormData();
    fd.append("user_id", userId);
    fd.append("user_name", userName);
    startTransition(async () => {
      const r = await sendRetentionPushAction(fd);
      if (r?.ok) setDone(true);
    });
  }

  if (done) {
    return <p className="mt-2 text-xs text-emerald-700">✓ Push de retenção enviado.</p>;
  }

  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending}
      className="mt-3 rounded-full bg-brava-blue px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
    >
      {pending ? "Enviando..." : "📤 Mandar push de retenção"}
    </button>
  );
}
