"use client";

import { useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/app/favoritos/actions";

export function FavoriteHeart({ estabId, initial }: { estabId: string; initial: boolean }) {
  const [isFav, setIsFav] = useState(initial);
  const [pending, startTransition] = useTransition();

  function fire(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const r = await toggleFavoriteAction(estabId);
      if (r.ok) setIsFav(r.isFav);
    });
  }

  return (
    <button
      type="button"
      onClick={fire}
      disabled={pending}
      aria-label={isFav ? "Desfavoritar" : "Favoritar"}
      className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-brava-card/85 backdrop-blur shadow-md transition hover:scale-110 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" fill={isFav ? "#FF4D6D" : "none"} stroke={isFav ? "#FF4D6D" : "currentColor"} strokeWidth="2" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572Z"/>
      </svg>
    </button>
  );
}
