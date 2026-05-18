import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Booking, BlockedDateRange, CreateBookingPayload } from '@/types'
import useAuthStore from '@/store/authStore'

export const useBookings = () => {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['bookings', user?.email],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>('/bookings')
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!user?.email,
    retry: false,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBookingPayload): Promise<Booking> => {
      const response = await apiClient.post<Booking>('/bookings', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] })
    },
  })
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string): Promise<void> => {
      await apiClient.put(`/bookings/${bookingId}/cancel`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useConfirmBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string): Promise<void> => {
      await apiClient.put(`/bookings/${bookingId}/confirm`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useRejectBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookingId: string): Promise<void> => {
      await apiClient.put(`/bookings/${bookingId}/reject`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

export const useListingBookings = (listingId: string) => {
  return useQuery({
    queryKey: ['listing-bookings', listingId],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(`/bookings/listing/${listingId}`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!listingId,
  })
}

export const useBookingById = (bookingId: string) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<Booking>(`/bookings/${bookingId}`)
      return response.data
    },
    enabled: !!bookingId,
  })
}

export const useBookedListingIds = (checkIn?: string, checkOut?: string) => {
  return useQuery({
    queryKey: ['booked-listing-ids', checkIn, checkOut],
    queryFn: async () => {
      const response = await apiClient.get<string[]>(
        `/bookings/booked-listing-ids?checkIn=${checkIn}&checkOut=${checkOut}`
      )
      return Array.isArray(response.data) ? response.data.filter(Boolean) : []
    },
    enabled: !!checkIn && !!checkOut,
    staleTime: 60_000,
  })
}

export const useAllBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>('/bookings/all')
      return Array.isArray(response.data) ? response.data : []
    },
  })
}

export const useAllListingBookings = (listingIds: string[]) => {
  const results = useQueries({
    queries: listingIds.map((id) => ({
      queryKey: ['listing-bookings', id],
      queryFn: async () => {
        const response = await apiClient.get<Booking[]>(`/bookings/listing/${id}`)
        return Array.isArray(response.data) ? response.data : []
      },
      enabled: !!id,
    })),
  })
  return {
    data: results.flatMap((r) => r.data ?? []),
    isLoading: results.some((r) => r.isLoading),
  }
}

export const useBlockedDates = (listingId: string) => {
  return useQuery({
    queryKey: ['blocked-dates', listingId],
    queryFn: async () => {
      const response = await apiClient.get<BlockedDateRange[]>(
        `/bookings/blocked-dates?listingId=${listingId}`
      )
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!listingId,
    staleTime: 60_000,
  })
}
