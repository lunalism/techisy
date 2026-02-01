export function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 animate-pulse">
      {/* Main article - 3 columns */}
      <div className="col-span-1 lg:col-span-3 relative min-h-[400px] lg:min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
          <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="mt-4 space-y-3">
            <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-full" />
            <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3" />
          </div>
          <div className="mt-4 h-4 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
      </div>

      {/* Side article - 1 column */}
      <div className="col-span-1 relative min-h-[400px] lg:min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="h-5 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
          <div className="mt-3 space-y-2">
            <div className="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-full" />
            <div className="h-5 bg-zinc-300 dark:bg-zinc-700 rounded w-4/5" />
          </div>
          <div className="mt-3 h-3 w-16 bg-zinc-300 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  )
}
