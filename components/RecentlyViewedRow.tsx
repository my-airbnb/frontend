'use client'

import ListingCard from '@/components/ListingCard'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

/** "Continue exploring" — a horizontal strip of the user's recently viewed stays. */
export default function RecentlyViewedRow() {
  const { data: listings = [] } = useRecentlyViewed()

  if (listings.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold text-foreground mb-1">Continue exploring</h2>
      <p className="text-sm text-muted-foreground mb-4">Places you recently viewed</p>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {listings.map((listing) => (
          <div key={listing.id} className="w-44 flex-shrink-0">
            <ListingCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  )
}
