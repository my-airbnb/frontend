'use client'

import { DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Listing } from '@/types'
import { useAllListingBookings } from '@/hooks/useBookings'
import { ListingEarnings } from './ListingEarnings'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export function HostEarningsTab({ hostListings, listingsLoading }: { hostListings: Listing[] | undefined; listingsLoading: boolean }) {
  const { data: allListingBookings, isLoading: earningsLoading } = useAllListingBookings((hostListings || []).map((l) => l.id))
  const confirmedBookings = allListingBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')

  if (listingsLoading || earningsLoading) return <LoadingSkeleton count={3} />
  if (!hostListings?.length) return (
    <div className="text-center py-20">
      <DollarSign className="h-16 w-16 text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No earnings yet</h3>
      <p className="text-muted-foreground">Create a listing to start earning.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-foreground text-background rounded-2xl p-6">
          <p className="text-sm opacity-70 mb-1">Total earned</p>
          <p className="text-3xl font-bold">${confirmedBookings.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Confirmed bookings</p>
          <p className="text-3xl font-bold">{confirmedBookings.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Active listings</p>
          <p className="text-3xl font-bold">{hostListings.length}</p>
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-3">By listing</h3>
        <div className="space-y-3">
          {hostListings.map((listing) => (
            <ListingEarnings key={listing.id} listingId={listing.id} listingTitle={listing.title} />
          ))}
        </div>
      </div>
    </div>
  )
}
