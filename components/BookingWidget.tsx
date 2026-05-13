'use client'

import { useState, useMemo } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useCreateBooking, useBlockedDates } from '@/hooks/useBookings'
import { useReviewStats } from '@/hooks/useReviews'
import useAuthStore from '@/store/authStore'
import { Listing } from '@/types'
import { useRouter } from 'next/navigation'

interface BookingWidgetProps {
  listing: Listing
}

const SERVICE_FEE_RATE = 0.12

const BookingWidget = ({ listing }: BookingWidgetProps) => {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { mutateAsync: createBooking, isPending } = useCreateBooking()
  const { data: blockedRanges = [] } = useBlockedDates(listing.id)
  const { data: reviewStats } = useReviewStats('LISTING', listing.id)

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange
  const [guests, setGuests] = useState(1)

  const nights =
    startDate && endDate
      ? Math.max(0, differenceInCalendarDays(endDate, startDate))
      : 0

  const subtotal = listing.pricePerNight * nights
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
  const total = subtotal + serviceFee

  const blockedDates = useMemo(() => {
    const dates: Date[] = []
    blockedRanges.forEach(({ checkIn, checkOut }) => {
      const start = new Date(checkIn)
      const end = new Date(checkOut)
      const current = new Date(start)
      while (current <= end) {
        dates.push(new Date(current))
        current.setDate(current.getDate() + 1)
      }
    })
    return dates
  }, [blockedRanges])

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!startDate || !endDate) {
      toast.error('Please select check-in and check-out dates.')
      return
    }

    if (nights <= 0) {
      toast.error('Check-out must be after check-in.')
      return
    }

    if (guests < 1 || guests > listing.maxGuests) {
      toast.error(`Guests must be between 1 and ${listing.maxGuests}.`)
      return
    }

    try {
      const booking = await createBooking({
        listingId: listing.id,
        type: 'LISTING',
        checkIn: format(startDate, 'yyyy-MM-dd'),
        checkOut: format(endDate, 'yyyy-MM-dd'),
        nbGuests: guests,
        totalPrice: total,
        serviceFee: serviceFee,
      })
      router.push(`/checkout/${booking.id}`)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create booking. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 sticky top-24">
      {/* Price header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-2xl font-bold text-gray-900">${listing.pricePerNight}</span>
          <span className="text-gray-500 text-sm"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <FiStar className="w-4 h-4 fill-gray-900 text-gray-900" />
          <span className="font-medium text-gray-900">
            {reviewStats && (reviewStats as any).totalReviews > 0
              ? reviewStats.averageRating.toFixed(1)
              : 'New'}
          </span>
        </div>
      </div>

      <form onSubmit={handleReserve} className="space-y-4">
        {/* Date inputs */}
        <div className="border border-gray-300 rounded-xl relative">
          <div className="px-4 py-3 border-b border-gray-300">
             <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Dates
              </label>
              <DatePicker
                selectsRange={true}
                startDate={startDate || undefined}
                endDate={endDate || undefined}
                onChange={(update) => {
                  setDateRange(update);
                }}
                minDate={new Date()}
                excludeDates={blockedDates}
                monthsShown={2}
                placeholderText="Add dates"
                className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer font-medium"
                dateFormat="MMM d, yyyy"
                required
              />
          </div>
          <div className="border-t border-gray-300 px-4 py-3">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1">
              Guests
            </label>
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(Math.min(listing.maxGuests, Math.max(1, Number(e.target.value))))}
              min={1}
              max={listing.maxGuests}
              className="w-full text-sm text-gray-700 outline-none bg-transparent"
            />
            <span className="text-xs text-gray-400">Max {listing.maxGuests} guests</span>
          </div>
        </div>

        {/* Reserve button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Reserving...' : isAuthenticated ? 'Reserve' : 'Log in to Reserve'}
        </button>

        {nights > 0 && (
          <p className="text-center text-sm text-gray-500">You won&apos;t be charged yet</p>
        )}

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-sm text-gray-700">
              <span>
                ${listing.pricePerNight} &times; {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-3">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default BookingWidget
