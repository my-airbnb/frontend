'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Calendar, Users, DollarSign, Star, CheckCircle, CreditCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Booking } from '@/types'
import { useCancelBooking } from '@/hooks/useBookings'
import { useListingReviews } from '@/hooks/useReviews'
import ReviewModal from './ReviewModal'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'

interface BookingCardProps {
  booking: Booking
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'outline',
  REJECTED: 'destructive',
}

const BookingCard = ({ booking }: BookingCardProps) => {
  const router = useRouter()
  const { user } = useAuthStore()
  const { mutate: cancel, isPending } = useCancelBooking()
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const { data: existingReviews } = useListingReviews(booking.listingId || '')
  const alreadyReviewed = reviewSubmitted || (existingReviews?.some(
    (r) => r.bookingId === booking.id && r.reviewerId === user?.id
  ) ?? false)

  const formatDate = (dateStr: string) => {
    try { return format(parseISO(dateStr), 'MMM dd, yyyy') }
    catch { return dateStr }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Booking ID</p>
            <p className="text-sm font-mono font-medium">{booking.id.substring(0, 8)}...</p>
          </div>
          <Badge variant={statusVariant[booking.status] || 'secondary'}>
            {booking.status}
          </Badge>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{booking.nbGuests} guest{booking.nbGuests !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span>
              Total: <span className="font-semibold text-foreground">${booking.totalPrice.toLocaleString()}</span>
              <span className="text-muted-foreground ml-1">(incl. ${booking.serviceFee} fee)</span>
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {booking.status === 'PENDING' && (
            <Button
              className="w-full"
              onClick={() => router.push(`/checkout/${booking.id}`)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          )}

          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => cancel(booking.id, {
                onSuccess: () => toast.success('Booking cancelled.'),
                onError: () => toast.error('Failed to cancel booking.'),
              })}
              disabled={isPending}
            >
              {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</> : 'Cancel Booking'}
            </Button>
          )}

          {(booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && !!booking.listingId && (
            alreadyReviewed ? (
              <div className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                Review submitted
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <Star className="mr-2 h-4 w-4" />
                Leave a Review
              </Button>
            )
          )}
        </div>

        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => { setReviewSubmitted(true); setIsReviewModalOpen(false) }}
          bookingId={booking.id}
          listingId={booking.listingId}
        />
      </CardContent>
    </Card>
  )
}

export default BookingCard
