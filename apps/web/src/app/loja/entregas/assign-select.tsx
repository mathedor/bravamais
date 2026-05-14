"use client";

import { useState } from "react";
import { assignDelivererAction } from "./actions";

interface TeamMember {
  id: string;
  full_name: string;
  phone: string;
  vehicle: string;
  is_online: boolean;
}

export function AssignSelect({ deliveryId, team }: { deliveryId: string; team: TeamMember[] }) {
  const [delivererId, setDelivererId] = useState<string>(team[0]?.id ?? "");

  if (team.length === 0) {
    return (
      <p className="text-xs text-amber-700">
        ⚠️ Nenhum entregador ativo na equipe. Cadastre em <a href="/loja/entregadores" className="underline">Entregadores</a>.
      </p>
    );
  }

  return (
    <form action={assignDelivererAction} className="flex items-center gap-2">
      <input type="hidden" name="delivery_id" value={deliveryId} />
      <select
        name="deliverer_id"
        value={delivererId}
        onChange={(e) => setDelivererId(e.target.value)}
        className="rounded-xl border border-brava-border bg-brava-paper px-3 py-1.5 text-xs"
      >
        {team.map((t) => (
          <option key={t.id} value={t.id}>
            {t.is_online ? "🟢" : "⚪"} {t.full_name} · {t.vehicle}
          </option>
        ))}
      </select>
      <button className="rounded-full bg-brava-yellow px-3 py-1.5 text-xs font-bold text-brava-black hover:scale-[1.02]">
        Atribuir
      </button>
    </form>
  );
}
