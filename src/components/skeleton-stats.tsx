export function SkeletonStatsCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-200 rounded-lg" />
        <div>
          <div className="h-4 w-16 bg-zinc-200 rounded mb-2" />
          <div className="h-8 w-24 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonSourceBar() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-3 h-3 rounded-full bg-zinc-200 flex-shrink-0" />
      <div className="w-28 h-4 bg-zinc-200 rounded" />
      <div className="flex-1 h-6 bg-zinc-100 rounded-full" />
      <div className="w-12 h-4 bg-zinc-200 rounded" />
    </div>
  )
}

export function SkeletonRecentArticle() {
  return (
    <div className="flex items-start gap-3 animate-pulse">
      <div className="w-1 h-12 rounded-full bg-zinc-200 flex-shrink-0 mt-1" />
      <div className="flex-1">
        <div className="h-4 bg-zinc-200 rounded w-full mb-1" />
        <div className="h-4 bg-zinc-200 rounded w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-16 bg-zinc-200 rounded" />
          <div className="h-4 w-12 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  )
}
