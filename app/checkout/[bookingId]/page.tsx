'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { useCreatePaymentIntent } from '@/hooks/usePayments'
import { useBookingById } from '@/hooks/useBookings'
import { useListing } from '@/hooks/useListings'
import CheckoutForm from '@/components/CheckoutForm'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { FiLock, FiCalendar, FiUsers, FiMapPin } from 'react-icons/fi'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function BookingSummary({ bookingId }: { bookingId: string }) {
  const { data: booking } = useBookingById(bookingId)
  const { data: listing } = useListing(booking?.listingId ?? '')

  if (!booking) return null

  const formatDate = (d: string) => {
    try { return format(parseISO(d), 'MMM dd, yyyy') } catch { return d }
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-6 space-y-3">
      {listing && (
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
            {listing.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{listing.title}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <FiMapPin className="w-3 h-3" />
              {listing.city}, {listing.country}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FiCalendar className="w-4 h-4 text-gray-400" />
        <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FiUsers className="w-4 h-4 text-gray-400" />
        <span>{booking.nbGuests} {booking.nbGuests === 1 ? 'guest' : 'guests'}</span>
      </div>
      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span>${booking.totalPrice.toLocaleString()}</span>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const bookingId = params.bookingId as string

  const { data: booking } = useBookingById(bookingId)
  const { mutateAsync: createPaymentIntent } = useCreatePaymentIntent()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!booking) return

    const initializePayment = async () => {
      try {
        const res = await createPaymentIntent({ bookingId, amount: booking.totalPrice })
        setClientSecret(res.clientSecret)
        setAmount(res.amount)
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to initialize payment'
        )
      }
    }

    initializePayment()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, booking?.totalPrice, isAuthenticated, hasHydrated])

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    )
  }

  if (!clientSecret) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-gray-500">Loading secure checkout...</p>
      </div>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: { colorPrimary: '#FF385C' },
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gray-100 p-3 rounded-full">
          <FiLock className="w-6 h-6 text-gray-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="text-gray-500 text-sm">Powered by Stripe</p>
        </div>
      </div>

      <BookingSummary bookingId={bookingId} />

      <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
          <CheckoutForm bookingId={bookingId} clientSecret={clientSecret} amount={amount} />
        </Elements>
      </div>
    </div>
  )
}
