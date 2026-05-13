'use client'

import React, { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { useConfirmPayment } from '@/hooks/usePayments'
import { useRouter } from 'next/navigation'

interface CheckoutFormProps {
  bookingId: string
  clientSecret: string
  amount: number
}

const CheckoutForm = ({ bookingId, clientSecret, amount }: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { mutateAsync: confirmPaymentOnBackend } = useConfirmPayment()

  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
        redirect: 'if_required',
      })

      if (submitError) {
        setError(submitError.message || 'An unexpected error occurred.')
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm on backend
        await confirmPaymentOnBackend({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method as string || '',
        })
        router.push('/dashboard?payment=success')
      } else {
        setError('Payment was not successful. Please try again.')
      }
    } catch (err) {
      setError('An error occurred while confirming payment.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  )
}

export default CheckoutForm
