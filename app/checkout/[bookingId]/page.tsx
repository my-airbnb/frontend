'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Lock, Calendar, Users, MapPin, ArrowLeft, Loader as Loader2 } from 'lucide-react'
import { useCreatePaymentIntent } from '@/hooks/usePayments'
import { useBookingById } from '@/hooks/useBookings'
import { useListing } from '@/hooks/useListings'
import CheckoutForm from '@/components/CheckoutForm'
import PromoCode from '@/components/PromoCode'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { getApiErrorMessage } from '@/lib/api-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/header'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

function BookingSummary({ bookingId, discount = 0 }: { bookingId: string; discount?: number }) {
  const { data: booking } = useBookingById(bookingId)
  const { data: listing } = useListing(booking?.listingId ?? '')
  if (!booking) return null
  const formatDate = (d: string) => { try { return format(parseISO(d), 'MMM dd, yyyy') } catch { return d } }
  const finalTotal = Math.max(0, booking.totalPrice - discount)

  return (
    <Card className="mb-6">
      <CardContent className="p-5 space-y-4">
        {listing && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                {listing.photos?.[0] && (
                  <Image src={listing.photos[0]} alt={listing.title} fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{listing.title}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />{listing.city}, {listing.country}
                </p>
              </div>
            </div>
            <Separator />
          </>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{booking.nbGuests} {booking.nbGuests === 1 ? 'guest' : 'guests'}</span>
        </div>
        <Separator />
        {discount > 0 && (
          <>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${booking.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Promo discount</span>
              <span>-${discount.toLocaleString()}</span>
            </div>
          </>
        )}
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>${finalTotal.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
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
  const [discount, setDiscount] = useState<number>(0)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const effectiveTotal = booking ? Math.max(0, booking.totalPrice - discount) : 0

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) { router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`); return }
    if (!booking) return
    createPaymentIntent({ bookingId, amount: effectiveTotal })
      .then((res) => { setClientSecret(res.clientSecret); setAmount(res.amount) })
      .catch((err) => setError(getApiErrorMessage(err, 'Failed to initialize payment')))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, booking?.totalPrice, discount, isAuthenticated, hasHydrated])

  const handleApplyCode = (code: string | null, value: number) => {
    setClientSecret(null) // re-issue the payment intent at the new amount
    setAppliedCode(code)
    setDiscount(code ? value : 0)
  }

  if (error) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-4xl mb-4">😕</p>
      <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
      <p className="text-destructive mb-6">{error}</p>
      <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
    </div>
  )

  if (!booking) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading secure checkout...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-muted p-3 rounded-full">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground text-sm">Powered by Stripe</p>
          </div>
        </div>

        <BookingSummary bookingId={bookingId} discount={discount} />

        <PromoCode amount={booking.totalPrice} appliedCode={appliedCode} onApply={handleApplyCode} />

        <Card>
          <CardContent className="p-6">
            {clientSecret ? (
              <Elements options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#000000' } } }} stripe={stripePromise}>
                <CheckoutForm bookingId={bookingId} clientSecret={clientSecret} amount={amount} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
