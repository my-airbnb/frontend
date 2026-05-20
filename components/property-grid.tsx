"use client"

import { useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import ListingCard from "@/components/ListingCard"
import { useListingsInfinite } from "@/hooks/useListings"
import { ListingFilters } from "@/types"

export function PropertyGrid() {
  const searchParams = useSearchParams()
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -720 : 720, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="h-6 w-48 rounded bg-muted animate-pulse mb-5" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-none w-48 animate-pulse">
                <div className="aspect-[4/3] rounded-2xl bg-muted" />
                <div className="mt-2 space-y-1.5">
                  <div className="h-3 w-3/4 rounded bg-muted" />
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
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-semibold mb-2">No places found</p>
          <p className="text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {filters.city ? `Places in ${filters.city} →` : 'Popular places to stay →'}
          </h2>
          <div className="flex items-center gap-2">
            {totalElements > 0 && (
              <span className="text-sm text-muted-foreground mr-2">
                {listings.length} of {totalElements}
              </span>
            )}
            <button
              onClick={() => scroll('left')}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll row */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-3 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {listings.map((listing) => (
            <div key={listing.id} className="flex-none w-48 sm:w-52">
              <ListingCard listing={listing} />
            </div>
          ))}

          {/* Load more sentinel at end of scroll */}
          {hasNextPage && (
            <div className="flex-none flex items-center justify-center px-4">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full whitespace-nowrap"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Loading…</>
                  : 'Show more'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
