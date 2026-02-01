export function SkeletonHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-pulse">
      {/* Main article */}
      <div className="lg:col-span-3">
        {/* Mobile: Image above text */}
        <div className="lg:hidden">
          <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="pt-4">
            <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="mt-2 space-y-2">
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </div>
            <div className="mt-3 h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>

        {/* Desktop: Overlay style */}
        <div className="hidden lg:block relative min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-700 rounded" />
            <div className="mt-4 space-y-3">
              <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-full" />
              <div className="h-8 bg-zinc-300 dark:bg-zinc-700 rounded w-2/3" />
            </div>
            <div className="mt-4 h-4 w-20 bg-zinc-300 dark:bg-zinc-700 rounded" />
          </div>
        </div>
      </div>

      {/* Side article */}
      <div className="lg:col-span-1">
        {/* Mobile: Image above text */}
        <div className="lg:hidden">
          <div className="aspect-[16/10] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="pt-4">
            <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="mt-2 space-y-2">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
            </div>
            <div className="mt-3 h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>

        {/* Desktop: Overlay style */}
        <div className="hidden lg:block relative min-h-[480px] bg-zinc-200 dark:bg-zinc-800 rounded-2xl">
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
    </div>
  )
}
