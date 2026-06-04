'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { useListingBookings, useConfirmBooking, useRejectBooking } from '@/hooks/useBookings'
import { toast } from 'sonner'

export function HostListingBookings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)
  const { mutate: confirm, isPending: isConfirming } = useConfirmBooking()
  const { mutate: reject, isPending: isRejecting } = useRejectBooking()

  if (isLoading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-20 bg-muted rounded-xl" />
    </div>
  )

  if (!bookings?.length) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{listingTitle}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.filter(Boolean).map((booking) => (
          <div key={booking.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">{booking.id.substring(0, 8)}…</span>
              <Badge variant={
                booking.status === 'CONFIRMED' ? 'default' :
                booking.status === 'PENDING' ? 'secondary' :
                booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'destructive' : 'outline'
              }>
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm mb-1">{booking.checkIn} → {booking.checkOut}</p>
            <p className="text-sm mb-3">{booking.nbGuests} guest{booking.nbGuests !== 1 ? 's' : ''} · <span className="font-semibold">${booking.totalPrice}</span></p>
            {booking.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => confirm(booking.id, { onSuccess: () => toast.success('Booking confirmed!') })} disabled={isConfirming || isRejecting}>
                  <Check className="h-3.5 w-3.5 mr-1" />Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => reject(booking.id, { onSuccess: () => toast.success('Booking rejected.') })} disabled={isConfirming || isRejecting}>
                  <X className="h-3.5 w-3.5 mr-1" />Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
