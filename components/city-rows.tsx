'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertyGrid } from './property-grid'
import type { ListingsPage } from '@/lib/server-api'

interface HomeListingsProps {
  initialCities: string[]
  topPicksInitialData?: ListingsPage
  cityInitialData: Record<string, ListingsPage>
}

export function HomeListings({ initialCities, topPicksInitialData, cityInitialData }: HomeListingsProps) {
  const searchParams = useSearchParams()
  const cityParam = searchParams.get('city')
  const hasAnySearch = cityParam || searchParams.get('type') || searchParams.get('checkIn')
  const resultsRef = useRef<HTMLDivElement>(null)

  // After a search, smoothly bring the results box into view (instead of the
  // page jumping to the top). Re-runs when the searched city changes.
  useEffect(() => {
    if (hasAnySearch) {
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [hasAnySearch, cityParam, searchParams])

  if (hasAnySearch) {
    return (
      <div ref={resultsRef} className="scroll-mt-24">
        <PropertyGrid layout="vertical" />
      </div>
    )
  }

  return (
    <>
      <PropertyGrid title="Top picks for you →" initialData={topPicksInitialData} eager />
      {initialCities.map((city) => (
        <PropertyGrid key={city} city={city} initialData={cityInitialData[city]} />
      ))}
    </>
  )
}
