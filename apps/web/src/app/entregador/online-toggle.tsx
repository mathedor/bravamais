"use client";

import { useTransition } from "react";
import { toggleOnlineAction } from "./actions";

export function OnlineToggle({ isOnline }: { isOnline: boolean }) {
  const [pending, start] = useTransition();

  function toggle() {
    const fd = new FormData();
    fd.set("online", isOnline ? "false" : "true");
    start(() => toggleOnlineAction(fd));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
        isOnline ? "bg-green-500 text-white" : "bg-white/10 text-white/70"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-white" : "bg-white/40"}`} />
      {pending ? "..." : isOnline ? "Online" : "Offline"}
    </button>
  );
}
