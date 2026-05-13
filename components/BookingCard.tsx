'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { FiCalendar, FiUsers, FiDollarSign, FiStar, FiCheckCircle, FiCreditCard } from 'react-icons/fi'
import { Booking } from '@/types'
import { useCancelBooking } from '@/hooks/useBookings'
import { useListingReviews } from '@/hooks/useReviews'
import ReviewModal from './ReviewModal'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'

interface BookingCardProps {
  booking: Booking
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
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

  const statusClass = statusColors[booking.status] || 'bg-gray-100 text-gray-800'

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Booking ID</p>
          <p className="text-sm font-mono font-medium text-gray-700">
            {booking.id.substring(0, 8)}...
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            {formatDate(booking.checkIn)} &rarr; {formatDate(booking.checkOut)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FiUsers className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            {booking.nbGuests} {booking.nbGuests === 1 ? 'guest' : 'guests'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <FiDollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>
            Total: <span className="font-semibold text-gray-900">${booking.totalPrice.toLocaleString()}</span>
            <span className="text-gray-400 ml-1">(incl. ${booking.serviceFee} fee)</span>
          </span>
        </div>
      </div>

      {booking.status === 'PENDING' && (
        <button
          onClick={() => router.push(`/checkout/${booking.id}`)}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <FiCreditCard className="w-4 h-4" />
          Pay Now
        </button>
      )}

      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
        <button
          onClick={() => cancel(booking.id)}
          disabled={isPending}
          className="mt-2 w-full border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-xl hover:border-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Cancelling...' : 'Cancel Booking'}
        </button>
      )}

      {(booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') && !!booking.listingId && (
        alreadyReviewed ? (
          <div className="mt-4 w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium py-2 rounded-xl">
            <FiCheckCircle className="w-4 h-4" />
            Review submitted
          </div>
        ) : (
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary hover:text-white text-sm font-medium py-2 rounded-xl transition-colors"
          >
            <FiStar className="w-4 h-4" />
            Leave a Review
          </button>
        )
      )}

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => { setReviewSubmitted(true); setIsReviewModalOpen(false) }}
        bookingId={booking.id}
        listingId={booking.listingId}
      />
    </div>
  )
}

export default BookingCard
