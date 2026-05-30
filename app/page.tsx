import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HomeListings } from "@/components/city-rows"
import { Footer } from "@/components/footer"
import { serverFetchCities, serverFetchListingsPage } from "@/lib/server-api"
import type { ListingsPage } from "@/lib/server-api"

// Render on each request so the listings (which live in client components that
// read useSearchParams) are server-rendered with real content instead of the
// "Loading listings..." Suspense fallback. Without this the whole listings
// section — and all its images — only render after the JS hydrates on the
// client. The per-request data fetches are still cached for 60s (see server-api).
export const dynamic = 'force-dynamic'

export default async function Home() {
  const allCities = await serverFetchCities()
  const selectedCities = [...allCities].sort(() => Math.random() - 0.5).slice(0, 5)

  const [topPicks, ...cityPages] = await Promise.all([
    serverFetchListingsPage({}, 0, 12),
    ...selectedCities.map((city) => serverFetchListingsPage({ city }, 0, 12)),
  ])

  const cityInitialData: Record<string, ListingsPage> = {}
  selectedCities.forEach((city, i) => {
    if (cityPages[i]) cityInitialData[city] = cityPages[i]!
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading listings...</div>}>
          <HomeListings
            initialCities={selectedCities}
            topPicksInitialData={topPicks ?? undefined}
            cityInitialData={cityInitialData}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
