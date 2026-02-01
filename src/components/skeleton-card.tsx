export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden">
        {/* Gradient overlay placeholder */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-300 dark:from-zinc-700 via-transparent to-transparent" />

        {/* Content placeholder */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="h-5 w-16 bg-zinc-300 dark:bg-zinc-600 rounded" />
          <div className="mt-2 space-y-2">
            <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-full" />
            <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-3/4" />
          </div>
          <div className="mt-2 h-3 w-14 bg-zinc-300 dark:bg-zinc-600 rounded" />
        </div>
      </div>
    </div>
  )
}
