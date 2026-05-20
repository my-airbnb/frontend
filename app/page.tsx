import { Suspense } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HomeListings } from "@/components/city-rows"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading listings...</div>}>
          <HomeListings />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
