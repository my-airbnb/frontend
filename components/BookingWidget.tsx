'use client'

import { useState, useMemo } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useCreateBooking, useBlockedDates } from '@/hooks/useBookings'
import { useReviewStats } from '@/hooks/useReviews'
import useAuthStore from '@/store/authStore'
import { Listing } from '@/types'
import { useRouter } from 'next/navigation'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'

interface BookingWidgetProps {
  listing: Listing
}

const SERVICE_FEE_RATE = 0.12

const BookingWidget = ({ listing }: BookingWidgetProps) => {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { mutateAsync: createBooking, isPending } = useCreateBooking()
  const { data: blockedRanges = [] } = useBlockedDates(listing.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviewStats } = useReviewStats('LISTING', listing.id)

  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)

  const startDate = dateRange?.from
  const endDate = dateRange?.to

  const nights = startDate && endDate ? Math.max(0, differenceInCalendarDays(endDate, startDate)) : 0
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
    if (!isAuthenticated) { router.push('/login'); return }
    if (!startDate || !endDate) { toast.error('Please select check-in and check-out dates.'); return }
    if (nights <= 0) { toast.error('Check-out must be after check-in.'); return }
    if (guests < 1 || guests > listing.maxGuests) { toast.error(`Guests must be between 1 and ${listing.maxGuests}.`); return }

    try {
      const booking = await createBooking({
        listingId: listing.id,
        type: 'LISTING',
        checkIn: format(startDate, 'yyyy-MM-dd'),
        checkOut: format(endDate, 'yyyy-MM-dd'),
        nbGuests: guests,
        totalPrice: total,
        serviceFee,
      })
      router.push(`/checkout/${booking.id}`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create booking.'
      toast.error(message)
    }
  }

  return (
    <div id="booking-widget" className="bg-card border border-border rounded-2xl shadow-lg p-6 lg:sticky lg:top-24 scroll-mt-24">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-2xl font-bold">${listing.pricePerNight}</span>
          <span className="text-muted-foreground text-sm"> / night</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="font-medium">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {reviewStats && (reviewStats as any).count > 0 ? reviewStats.averageRating.toFixed(1) : 'New'}
          </span>
        </div>
      </div>

      <form onSubmit={handleReserve} className="space-y-4">
        {/* Date picker */}
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              'w-full rounded-xl border border-border px-4 py-3 text-left text-sm hover:bg-secondary/50 transition-colors',
              !dateRange && 'text-muted-foreground'
            )}>
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Dates</div>
              {startDate && endDate
                ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`
                : startDate
                ? `${format(startDate, 'MMM d')} – Select checkout`
                : 'Add dates'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => date < new Date() || blockedDates.some((d) => d.toDateString() === date.toDateString())}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <div className="rounded-xl border border-border px-4 py-3">
          <div className="text-xs font-bold uppercase tracking-wider mb-1">Guests</div>
          <div className="flex items-center justify-between">
            <input
              type="number"
              value={guests}
              onChange={(e) => setGuests(Math.min(listing.maxGuests, Math.max(1, Number(e.target.value))))}
              min={1}
              max={listing.maxGuests}
              className="text-sm bg-transparent outline-none w-20 font-medium"
            />
            <span className="text-xs text-muted-foreground">Max {listing.maxGuests}</span>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={isPending}>
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reserving...</> : isAuthenticated ? 'Reserve' : 'Log in to Reserve'}
        </Button>

        {nights > 0 && <p className="text-center text-sm text-muted-foreground">You won&apos;t be charged yet</p>}

        {nights > 0 && (
          <div className="space-y-3 pt-2">
            <Separator />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${listing.pricePerNight} × {nights} night{nights !== 1 ? 's' : ''}</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
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
