'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { FiSliders, FiX, FiMap, FiGrid } from 'react-icons/fi'
import SearchBar from '@/components/SearchBar'
import ListingCard from '@/components/ListingCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { useListingsInfinite, useListingSearch } from '@/hooks/useListings'
import { useBookedListingIds } from '@/hooks/useBookings'
import { ListingFilters } from '@/types'

const ListingsMap = dynamic(() => import('@/components/ListingsMap'), { ssr: false })

const CATEGORIES = [
  { label: 'Beachfront', icon: '🏖️', type: 'beachfront' },
  { label: 'Mountains', icon: '⛰️', type: 'mountain' },
  { label: 'Countryside', icon: '🌾', type: 'countryside' },
  { label: 'City', icon: '🏙️', type: 'city' },
  { label: 'Cabins', icon: '🏕️', type: 'cabin' },
  { label: 'Pools', icon: '🏊', type: 'pool' },
  { label: 'Castles', icon: '🏰', type: 'castle' },
  { label: 'Islands', icon: '🏝️', type: 'island' },
]

const POPULAR_DESTINATIONS = [
  'Paris', 'London', 'Amsterdam', 'Barcelona', 'Tokyo',
  'New York', 'Rome', 'Berlin', 'Sydney', 'Dubai',
]

export default function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [appliedMin, setAppliedMin] = useState<number | undefined>()
  const [appliedMax, setAppliedMax] = useState<number | undefined>()

  useEffect(() => {
    if (!filtersOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFiltersOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtersOpen])

  const filters: ListingFilters = {
    city: searchParams.get('city') || undefined,
    checkIn: searchParams.get('checkIn') || undefined,
    checkOut: searchParams.get('checkOut') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    type: activeCategory || undefined,
    minPrice: appliedMin,
    maxPrice: appliedMax,
  }

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListingsInfinite(filters)

  const { data: bookedIds } = useBookedListingIds(filters.checkIn, filters.checkOut)
  const bookedSet = new Set(bookedIds ?? [])

  const allListings = data?.pages.flatMap((p) => p.content ?? []).filter(Boolean) ?? []
  const listings = bookedSet.size > 0
    ? allListings.filter((l) => !bookedSet.has(l.id))
    : allListings
  const totalElements = data?.pages[0]?.totalElements ?? 0

  const hasActiveSearch = !!(filters.city || filters.checkIn || filters.checkOut || filters.guests)
  const searchedCity = filters.city

  const shouldSuggest = !isLoading && listings.length === 0 && !!searchedCity
  const { data: suggestions = [], isLoading: loadingSuggestions } = useListingSearch(
    searchedCity || '',
    shouldSuggest
  )

  const suggestedCities = Array.from(
    new Set(suggestions.map((l) => l.city).filter(Boolean))
  ).slice(0, 6)

  const handleCategoryClick = (type: string) => {
    setActiveCategory((prev) => (prev === type ? null : type))
  }

  const handleSuggestionClick = (city: string) => {
    router.push(`/?city=${encodeURIComponent(city)}`)
  }

  const handleApplyFilters = () => {
    setAppliedMin(minPrice ? Number(minPrice) : undefined)
    setAppliedMax(maxPrice ? Number(maxPrice) : undefined)
    setFiltersOpen(false)
  }

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setAppliedMin(undefined)
    setAppliedMax(undefined)
    setFiltersOpen(false)
  }

  const hasActiveFilters = appliedMin !== undefined || appliedMax !== undefined

  return (
    <>
      {/* Hero section */}
      {!hasActiveSearch && !activeCategory && (
        <section className="relative overflow-hidden">
          <div className="relative h-[300px] sm:h-[420px] md:h-[480px] w-full">
            <Image
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600"
              alt="Beautiful vacation home"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                Find your next
                <br />
                <span className="text-primary">adventure</span>
              </h1>
              <p className="text-sm sm:text-lg text-white/90 mb-5 sm:mb-8 max-w-md drop-shadow">
                Discover unique places to stay around the world
              </p>
              <div className="w-full max-w-3xl">
                <SearchBar />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category filters + filter button */}
      <section className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Scrollable categories with fade gradients */}
            <div className="relative flex-1 min-w-0">
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.type
                  return (
                    <button
                      key={cat.label}
                      onClick={() => handleCategoryClick(cat.type)}
                      className={`flex flex-col items-center gap-1.5 flex-shrink-0 pb-2 transition-all px-2 group border-b-2 ${
                        isActive
                          ? 'text-gray-900 border-gray-900'
                          : 'text-gray-500 hover:text-gray-900 border-transparent hover:border-gray-900'
                      }`}
                    >
                      <span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {cat.icon}
                      </span>
                      <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
              {/* Fade overlay on right edge */}
              <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>

            {/* Filters button */}
            <button
              onClick={() => setFiltersOpen(true)}
              className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-sm font-medium flex-shrink-0 transition-colors ${
                hasActiveFilters
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-700 hover:border-gray-500'
              }`}
            >
              <FiSliders className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-white text-gray-900 rounded-full text-xs font-bold flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Filters modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setFiltersOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price range (per night)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min={0}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <span className="text-gray-400">–</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min={0}
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClearFilters}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 text-sm transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header when filtering */}
        {(hasActiveSearch || activeCategory || hasActiveFilters) && (
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {isLoading
                  ? 'Searching...'
                  : `${totalElements} place${totalElements !== 1 ? 's' : ''} found`}
              </h2>
              {!isLoading && listings.length > 0 && (
                <button
                  onClick={() => setShowMap((v) => !v)}
                  className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {showMap ? <FiGrid className="w-4 h-4" /> : <FiMap className="w-4 h-4" />}
                  {showMap ? 'Grid view' : 'Map view'}
                </button>
              )}
              {filters.city && (
                <p className="text-gray-500 mt-1">in {filters.city}</p>
              )}
              {activeCategory && (
                <p className="text-gray-500 mt-1">
                  Category: {CATEGORIES.find((c) => c.type === activeCategory)?.label}
                </p>
              )}
              {hasActiveFilters && (
                <p className="text-gray-500 mt-1">
                  {appliedMin !== undefined && `From $${appliedMin}`}
                  {appliedMin !== undefined && appliedMax !== undefined && ' · '}
                  {appliedMax !== undefined && `Up to $${appliedMax}`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {activeCategory && (
                <button
                  onClick={() => setActiveCategory(null)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Clear category
                </button>
              )}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {!hasActiveSearch && !activeCategory && !hasActiveFilters && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular places to stay
            </h2>
            {listings.length > 0 && (
              <button
                onClick={() => setShowMap((v) => !v)}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:border-gray-500 transition-colors"
              >
                {showMap ? <FiGrid className="w-4 h-4" /> : <FiMap className="w-4 h-4" />}
                {showMap ? 'Show grid' : 'Show map'}
              </button>
            )}
          </div>
        )}

        {/* Main content */}
        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Could not load listings</h3>
            <p className="text-gray-500">Please check your connection and try again.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No listings found{searchedCity ? ` in "${searchedCity}"` : ''}
            </h3>
            <p className="text-gray-500 mb-8">
              {hasActiveSearch ? "We couldn't find any stays matching your search." : 'Try a different category or filter.'}
            </p>
            {shouldSuggest && (
              <div className="mt-6">
                {loadingSuggestions ? (
                  <p className="text-gray-400 text-sm">Finding similar destinations…</p>
                ) : suggestedCities.length > 0 ? (
                  <>
                    <p className="text-gray-600 font-medium mb-4">Did you mean one of these?</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {suggestedCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleSuggestionClick(city)}
                          className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-primary hover:text-primary transition-all"
                        >
                          📍 {city}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium mb-4">Explore popular destinations instead:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {POPULAR_DESTINATIONS.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleSuggestionClick(city)}
                          className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:border-primary hover:text-primary transition-all"
                        >
                          📍 {city}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : showMap ? (
          <ListingsMap listings={listings} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-full hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 min-w-[140px]"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Show more'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
