'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import ListingCard from '@/components/ListingCard'
import { useListingsByIds } from '@/hooks/useListings'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'

function WishlistContent() {
  const { user } = useAuthStore()
  const { getItems } = useWishlistStore()
  const hydrated = useHasHydrated()
  const ids = hydrated ? getItems() : []
  const { data: listings, isLoading } = useListingsByIds(ids)

  if (!hydrated || isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] rounded-xl bg-muted" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-5">
          <Heart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">No saved places yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          Tap the heart on any listing to save it here for later.
        </p>
        <Link href="/">
          <Button>Start exploring</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {(listings ?? []).map((listing, i) => (
        <ListingCard key={listing.id} listing={listing} priority={i < 4} />
      ))}
    </div>
  )
}

export default function WishlistsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-8 pb-24 md:pb-8">
        <h1 className="text-2xl font-bold mb-6">Saved places</h1>
        <Suspense>
          <WishlistContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
