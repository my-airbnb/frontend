'use client'

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
  const hasAnySearch = searchParams.get('city') || searchParams.get('type') || searchParams.get('checkIn')

  if (hasAnySearch) {
    return <PropertyGrid layout="vertical" />
  }

  return (
    <>
      <PropertyGrid title="Top picks for you →" initialData={topPicksInitialData} />
      {initialCities.map((city) => (
        <PropertyGrid key={city} city={city} initialData={cityInitialData[city]} />
      ))}
    </>
  )
}
