import { useMutation, useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { PaymentIntentResponse, ConfirmPaymentPayload } from '@/types'

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: async (data: { bookingId: string; amount: number }): Promise<PaymentIntentResponse> => {
      const response = await apiClient.post<PaymentIntentResponse>('/payments/intent', data)
      return response.data
    },
  })
}

export const useConfirmPayment = () => {
  return useMutation({
    mutationFn: async (payload: ConfirmPaymentPayload): Promise<void> => {
      await apiClient.post('/payments/confirm', payload)
    },
  })
}

export const useGetPayment = (bookingId: string) => {
  return useQuery({
    queryKey: ['payments', bookingId],
    queryFn: async (): Promise<PaymentIntentResponse> => {
      const response = await apiClient.get<PaymentIntentResponse>(`/payments/${bookingId}`)
      return response.data
    },
    enabled: !!bookingId,
  })
}
