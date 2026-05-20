"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ListingCard from "@/components/ListingCard"
import { useListingsInfinite } from "@/hooks/useListings"
import { ListingFilters } from "@/types"

export function PropertyGrid() {
  const searchParams = useSearchParams()

  const filters: ListingFilters = useMemo(() => ({
    city: searchParams.get('city') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    type: searchParams.get('type') || undefined,
  }), [searchParams])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useListingsInfinite(filters)

  const listings = data?.pages.flatMap((p) => p.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-muted" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-1/3 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Failed to load listings. Please try again.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-semibold text-foreground mb-2">No places found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">
            {filters.city ? `Places in ${filters.city}` : 'Popular places to stay'}
          </h2>
          {totalElements > 0 && (
            <span className="text-sm text-muted-foreground">
              {listings.length} of {totalElements} places
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Show More / End */}
        <div className="mt-10 flex flex-col items-center gap-3">
          {hasNextPage ? (
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-10 h-12 font-medium"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                'Show more'
              )}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">You&apos;ve seen all {totalElements} listings</p>
          )}
        </div>
      </div>
    </section>
  )
}
