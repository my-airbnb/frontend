'use client'

import { useListingBookings } from '@/hooks/useBookings'

export function ListingEarnings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)
  if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded-xl" />
  const confirmed = (bookings || []).filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
  const total = confirmed.reduce((sum, b) => sum + b.totalPrice, 0)
  if (!confirmed.length) return null
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
      <div>
        <p className="text-sm font-semibold truncate max-w-[220px]">{listingTitle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{confirmed.length} confirmed booking{confirmed.length !== 1 ? 's' : ''}</p>
      </div>
      <span className="text-lg font-bold">${total.toLocaleString()}</span>
    </div>
  )
}
