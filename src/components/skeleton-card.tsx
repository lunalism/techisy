export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      {/* Image */}
      <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />

      {/* Content */}
      <div className="pt-4">
        {/* Source tag */}
        <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />

        {/* Title */}
        <div className="mt-2 space-y-2">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        </div>

        {/* Time */}
        <div className="mt-3 h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  )
}
