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
  const typeParam = searchParams.get('type')
  const checkInParam = searchParams.get('checkIn')
  const hasAnySearch = cityParam || typeParam || checkInParam
  const resultsRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  // Smooth-scroll to the results ONLY when the user performs a new search —
  // not on initial load/refresh (where the URL may already carry ?city=...).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (hasAnySearch) {
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [cityParam, typeParam, checkInParam, hasAnySearch])

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
