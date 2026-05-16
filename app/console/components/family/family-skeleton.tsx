const CARD_SHADOW = "shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

function SkeletonBar({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`}
      aria-hidden
    />
  );
}

function SkeletonCard() {
  return (
    <div className={`rounded-3xl bg-white p-4 ${CARD_SHADOW}`}>
      <div className="flex items-center gap-3.5">
        <SkeletonBar className="h-12 w-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-3 w-20" />
        </div>
        <SkeletonBar className="h-5 w-5 rounded" />
      </div>
    </div>
  );
}

export function FamilyPageSkeleton() {
  return (
    <div>
      <header className="sticky top-0 z-20 bg-[#F2F2F7]/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md">
        <SkeletonBar className="h-9 w-20" />
        <div className="mt-3 h-px w-full bg-gray-200/90" aria-hidden />
      </header>

      <div className="space-y-4 px-4 pb-6 pt-4">
        <SkeletonCard />
        <SkeletonCard />
        <div className="flex items-center justify-between px-1 pt-2">
          <SkeletonBar className="h-3 w-16" />
          <div className="flex gap-2">
            <SkeletonBar className="h-9 w-9 rounded-full" />
            <SkeletonBar className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
