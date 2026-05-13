import { SkeletonGrid, SkeletonHero } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
      <SkeletonHero />
      <div className="mt-8">
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
