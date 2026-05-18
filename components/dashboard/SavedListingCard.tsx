'use client'

import ListingCard from '@/components/ListingCard'
import { useListing } from '@/hooks/useListings'

export function SavedListingCard({ listingId }: { listingId: string }) {
  const { data: listing, isLoading } = useListing(listingId)
  if (isLoading) return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-muted mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
  if (!listing) return null
  return <ListingCard listing={listing} />
}
