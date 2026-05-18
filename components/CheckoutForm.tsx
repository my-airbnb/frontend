'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useConfirmPayment } from '@/hooks/usePayments'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CheckoutFormProps {
  bookingId: string
  clientSecret: string
  amount: number
}

const CheckoutForm = ({ amount }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { mutateAsync: confirmPaymentOnBackend } = useConfirmPayment()
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setIsProcessing(true)
    setError(null)
    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/dashboard` },
        redirect: 'if_required',
      })
      if (submitError) { setError(submitError.message || 'An unexpected error occurred.'); return }
      if (paymentIntent?.status === 'succeeded') {
        await confirmPaymentOnBackend({ paymentIntentId: paymentIntent.id, paymentMethodId: (paymentIntent.payment_method as string) || '' })
        router.push('/dashboard?payment=success')
      } else {
        setError('Payment was not successful. Please try again.')
      }
    } catch {
      setError('An error occurred while confirming payment.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full h-12 text-base" disabled={isProcessing || !stripe || !elements}>
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : `Pay $${amount}`}
      </Button>
    </form>
  )
}

export default CheckoutForm
