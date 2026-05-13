export function ReviewStars({ rating, size = 14 }: { rating: number; size?: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${r.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(r);
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#FFC500" : "none"} stroke="#FFC500" strokeWidth="1.5">
            <path d="m12 2 3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" strokeLinejoin="round" />
          </svg>
        );
      })}
    </span>
  );
}
