/**
 * Shared skeleton loading components for the site.
 * Uses animate-pulse for a consistent loading feel.
 */

const skeletonClass = 'animate-pulse bg-gray-200 rounded'

export function Skeleton({ className = '', ...props }) {
  return <div className={`${skeletonClass} ${className}`.trim()} {...props} />
}

/** Single line of text skeleton */
export function SkeletonText({ className = '', width = '100%' }) {
  return (
    <Skeleton className={`h-4 ${className}`.trim()} style={{ width: width === '100%' ? '100%' : width }} />
  )
}

/** Video placeholder (aspect-video) */
export function SkeletonVideo({ className = '' }) {
  return (
    <div className={`w-full aspect-video rounded-2xl overflow-hidden ${skeletonClass} ${className}`.trim()} />
  )
}

/** Project card skeleton (thumbnail + title + author) */
export function SkeletonProjectCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-md flex flex-col ${className}`.trim()}>
      <Skeleton className="w-full h-24 sm:h-28 rounded-none" />
      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

/** Featured card skeleton (larger) */
export function SkeletonFeaturedCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-md flex flex-col ${className}`.trim()}>
      <Skeleton className="w-full aspect-video rounded-none" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

/** Project detail page: title + video + info block */
export function SkeletonProjectDetailContent({ className = '' }) {
  return (
    <div className={`flex-1 min-w-0 ${className}`.trim()}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-48" />
      </div>
      <SkeletonVideo className="mb-4" />
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

/** Project detail sidebar: related section skeleton */
export function SkeletonProjectSidebar({ className = '' }) {
  return (
    <aside className={`lg:w-72 shrink-0 ${className}`.trim()}>
      <div className="bg-gray-100 rounded-2xl p-4 space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

/** Full project detail page skeleton (for initial load when no project) */
export function SkeletonProjectPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <SkeletonProjectDetailContent />
          <SkeletonProjectSidebar />
        </div>
      </div>
    </div>
  )
}

/** Home page: featured strip + grid of cards */
export function SkeletonHomePage() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
      <section>
        <div className="rounded-2xl sm:rounded-3xl bg-gray-100 p-3 sm:p-4">
          <Skeleton className="h-8 w-56 mx-auto mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonFeaturedCard key={i} />
            ))}
          </div>
        </div>
      </section>
      <section>
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}

/** Loading more: row of card skeletons */
export function SkeletonLoadingMore() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 py-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonProjectCard key={i} />
      ))}
    </div>
  )
}

/** Top creators page: list of creator rows */
export function SkeletonTopCreatorsPage() {
  return (
    <div className="p-4 sm:p-6">
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <Skeleton className="h-5 flex-1 max-w-[200px]" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
