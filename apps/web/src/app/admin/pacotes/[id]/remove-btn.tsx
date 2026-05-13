"use client";

import { useTransition } from "react";
import { removeCouponFromPackageAction } from "../actions";

export function RemoveCouponBtn({ packageId, couponId }: { packageId: string; couponId: string }) {
  const [pending, startTransition] = useTransition();
  function fire() {
    const fd = new FormData(); fd.append("package_id", packageId); fd.append("coupon_id", couponId);
    startTransition(async () => { await removeCouponFromPackageAction(fd); });
  }
  return (
    <button type="button" onClick={fire} disabled={pending} className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-60">
      {pending ? "..." : "Remover"}
    </button>
  );
}
