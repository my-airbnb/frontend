import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoryFilters } from "@/components/category-filters"
import { PropertyGrid } from "@/components/property-grid"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoryFilters />
        <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading listings...</div>}>
          <PropertyGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
