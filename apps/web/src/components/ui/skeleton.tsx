export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-brava-paper/70 ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-brava-border bg-brava-card p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <Skeleton className="mt-4 h-10 w-full" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brava-border bg-brava-card p-3">
      <Skeleton className="h-16 w-16 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-brava-black to-brava-blue p-6 sm:p-10">
      <Skeleton className="h-3 w-24 bg-white/15" />
      <Skeleton className="mt-3 h-10 w-64 bg-white/15" />
      <Skeleton className="mt-3 h-4 w-80 bg-white/10" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
        <Skeleton className="h-20 bg-white/10" />
        <Skeleton className="h-20 bg-white/10" />
      </div>
    </section>
  );
}
