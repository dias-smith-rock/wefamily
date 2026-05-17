function Bar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200/80 ${className}`}
      aria-hidden
    />
  );
}

export function CalendarPageSkeleton() {
  return (
    <div className="relative min-h-full">
      <div className="sticky top-0 z-40 bg-[#F2F2F7]/80 px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Bar className="h-10 w-10 rounded-full" />
          <Bar className="h-5 w-28" />
          <Bar className="h-9 w-12 rounded-full" />
        </div>
        <div className="mt-3 h-px bg-gray-200/90" />
      </div>

      <div className="flex gap-2 overflow-hidden px-4 pt-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex w-[14%] min-w-[3.5rem] shrink-0 flex-col items-center gap-2"
          >
            <Bar className="h-3 w-6" />
            <Bar className="h-9 w-9 rounded-full" />
            <Bar className="h-1.5 w-1.5 rounded-full" />
          </div>
        ))}
      </div>

      <div className="space-y-5 px-4 pb-28 pt-6">
        <div className="flex gap-4">
          <Bar className="h-4 w-10" />
          <Bar className="h-32 flex-1 rounded-3xl" />
        </div>
        <div className="flex gap-4">
          <Bar className="h-4 w-10" />
          <Bar className="h-28 flex-1 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
