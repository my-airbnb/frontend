'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertyGrid } from './property-grid'
import { useDistinctCities } from '@/hooks/useListings'
import { Loader2 } from 'lucide-react'

function CityRowSkeleton() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="h-6 w-52 rounded bg-muted animate-pulse mb-5" />
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

export function HomeListings() {
  const searchParams = useSearchParams()
  const searchCity = searchParams.get('city')

  const { data: allCities, isLoading } = useDistinctCities()

  const randomCities = useMemo(() => {
    if (!allCities?.length) return []
    const shuffled = [...allCities].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 5)
  }, [allCities])

  // If user searched a city, show just that city row
  if (searchCity) {
    return <PropertyGrid />
  }

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => <CityRowSkeleton key={i} />)}
      </>
    )
  }

  return (
    <>
      {randomCities.map((city) => (
        <PropertyGrid key={city} city={city} />
      ))}
    </>
  )
}
