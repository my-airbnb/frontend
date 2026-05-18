'use client'

const LoadingSkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-2xl w-full aspect-square mb-3" />
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-8" />
      </div>
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-1/4 mt-1" />
    </div>
  </div>
)

interface LoadingSkeletonProps {
  count?: number
}

const LoadingSkeleton = ({ count = 8 }: LoadingSkeletonProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <LoadingSkeletonCard key={i} />
    ))}
  </div>
)

export default LoadingSkeleton
