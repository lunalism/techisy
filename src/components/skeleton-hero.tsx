export function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 animate-pulse">
      {/* Main article */}
      <div className="lg:col-span-3">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden">
          {/* Gradient overlay placeholder */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-300 dark:from-zinc-700 via-transparent to-transparent" />

          {/* Content placeholder */}
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-10">
            <div className="h-6 w-20 lg:w-24 bg-zinc-300 dark:bg-zinc-600 rounded" />
            <div className="mt-3 lg:mt-4 space-y-2 lg:space-y-3">
              <div className="h-5 lg:h-8 bg-zinc-300 dark:bg-zinc-600 rounded w-full" />
              <div className="h-5 lg:h-8 bg-zinc-300 dark:bg-zinc-600 rounded w-2/3" />
            </div>
            <div className="mt-3 lg:mt-4 h-4 w-16 lg:w-20 bg-zinc-300 dark:bg-zinc-600 rounded" />
          </div>
        </div>
      </div>

      {/* Side article */}
      <div className="lg:col-span-1">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden">
          {/* Gradient overlay placeholder */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-300 dark:from-zinc-700 via-transparent to-transparent" />

          {/* Content placeholder */}
          <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
            <div className="h-5 w-16 lg:w-20 bg-zinc-300 dark:bg-zinc-600 rounded" />
            <div className="mt-2 lg:mt-3 space-y-2">
              <div className="h-4 lg:h-5 bg-zinc-300 dark:bg-zinc-600 rounded w-full" />
              <div className="h-4 lg:h-5 bg-zinc-300 dark:bg-zinc-600 rounded w-4/5" />
            </div>
            <div className="mt-2 lg:mt-3 h-3 w-14 lg:w-16 bg-zinc-300 dark:bg-zinc-600 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
