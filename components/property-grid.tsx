"use client"

import { useMemo, useRef, useEffect, useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import ListingCard from "@/components/ListingCard"
import { useListingsInfinite } from "@/hooks/useListings"
import { ListingFilters } from "@/types"

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

const SEE_ALL_CARD_COUNT = 6

interface PropertyGridProps {
  city?: string
  title?: string
  layout?: 'horizontal' | 'vertical'
}

export function PropertyGrid({ city: cityProp, title, layout = 'horizontal' }: PropertyGridProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [prioritySet, setPrioritySet] = useState<Set<number>>(new Set([0, 1, 2]))
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filters: ListingFilters = useMemo(() => ({
    city: cityProp ?? searchParams.get('city') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    type: searchParams.get('type') || undefined,
  }), [cityProp, searchParams])

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useListingsInfinite(filters)

  const allListings = data?.pages.flatMap((p) => p.content) ?? []
  const totalElements = data?.pages[0]?.totalElements ?? 0

  // For horizontal: only show first SEE_ALL_CARD_COUNT listings
  const listings = layout === 'horizontal' ? allListings.slice(0, SEE_ALL_CARD_COUNT) : allListings

  // Dynamic image priority via IntersectionObserver (horizontal only)
  useEffect(() => {
    if (layout !== 'horizontal') return
    const scrollEl = scrollRef.current
    if (!scrollEl || listings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        setPrioritySet(prev => {
          const next = new Set(prev)
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const idx = Number((entry.target as HTMLElement).dataset.idx)
              if (!isNaN(idx)) {
                next.add(idx)
                next.add(idx + 1)
                next.add(idx + 2)
              }
            }
          })
          return next
        })
      },
      { root: scrollEl, rootMargin: '0px 400px 0px 0px', threshold: 0 }
    )

    cardRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [listings.length, layout])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -720 : 720, behavior: 'smooth' })
  }

  const seeAllHref = useMemo(() => {
    const city = cityProp ?? searchParams.get('city')
    if (!city) return '/'
    return `/?city=${encodeURIComponent(city)}`
  }, [cityProp, searchParams])

  const heading = title ?? (
    filters.city
      ? `Places in ${filters.city}`
      : layout === 'vertical'
        ? 'Search results'
        : 'Top picks for you'
  )

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="h-6 w-48 rounded bg-muted animate-pulse mb-5" />
          <div className={layout === 'horizontal'
            ? "flex gap-4 overflow-hidden"
            : "grid grid-cols-2 sm:grid-cols-3 gap-4"
          }>
            {Array.from({ length: layout === 'horizontal' ? 7 : 8 }).map((_, i) => (
              <div key={i} className={layout === 'horizontal' ? "flex-none w-48 animate-pulse" : "animate-pulse"}>
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

  // ---- VERTICAL layout: card grid + sticky map ----
  if (layout === 'vertical') {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{heading}</h2>
            <p className="text-sm text-muted-foreground mt-1">{totalElements} places found</p>
          </div>

          <div className="flex gap-6 relative">
            {/* Left: card grid */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    onMouseEnter={() => setHoveredId(listing.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <ListingCard listing={listing} priority={index < 6} />
                  </div>
                ))}
              </div>
              {hasNextPage && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    className="rounded-full px-8"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</>
                      : 'Show more'}
                  </Button>
                </div>
              )}
            </div>

            {/* Right: sticky map */}
            <div className="hidden lg:block w-[46%] shrink-0">
              <div className="sticky top-20 h-[calc(100vh-6rem)] rounded-2xl overflow-hidden">
                <MapView listings={allListings} hoveredId={hoveredId} />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ---- HORIZONTAL layout: fixed 6 cards + "See all" card ----
  const seeAllPhotos = allListings
    .slice(0, 4)
    .map(l => l.photos?.[0])
    .filter(Boolean)

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{heading}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
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

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-3 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="flex-none w-48 sm:w-52"
              ref={(el) => { cardRefs.current[index] = el }}
              data-idx={index}
            >
              <ListingCard listing={listing} priority={prioritySet.has(index)} />
            </div>
          ))}

          {/* "See all" card — last item in the row */}
          {(totalElements > SEE_ALL_CARD_COUNT || cityProp) && (
            <div className="flex-none w-48 sm:w-52 cursor-pointer" onClick={() => router.push(seeAllHref)}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                {/* 2×2 photo collage */}
                {seeAllPhotos.length >= 4 ? (
                  <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                    {seeAllPhotos.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="w-full h-full object-cover" />
                    ))}
                  </div>
                ) : seeAllPhotos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seeAllPhotos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-400 to-rose-600" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                  <span className="text-sm font-semibold">See all</span>
                  {cityProp && (
                    <span className="text-xs mt-0.5 opacity-80">{cityProp}</span>
                  )}
                  {totalElements > 0 && (
                    <span className="text-xs mt-1 opacity-70">{totalElements} places</span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium truncate">
                {cityProp ? `All places in ${cityProp}` : 'See all results'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
