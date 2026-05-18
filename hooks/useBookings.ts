import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Booking, CreateBookingPayload } from '@/types'
import useAuthStore from '@/store/authStore'

export const useBookings = () => {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['bookings', user?.email],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(`/bookings?guestId=${encodeURIComponent(user?.email || '')}`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!user?.email,
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
      const response = await apiClient.get<Booking[]>(`/bookings?listingId=${listingId}`)
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
      const response = await apiClient.get<Booking[]>(
        `/bookings?checkIn=${checkIn}&checkOut=${checkOut}&status=CONFIRMED`
      )
      const arr = Array.isArray(response.data) ? response.data : []
      return arr.map((b) => b.listingId).filter(Boolean)
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
        const response = await apiClient.get<Booking[]>(`/bookings?listingId=${id}`)
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
      const response = await apiClient.get<Booking[]>(
        `/bookings?listingId=${listingId}&status=CONFIRMED`
      )
      const arr = Array.isArray(response.data) ? response.data : []
      return arr.map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }))
    },
    enabled: !!listingId,
    staleTime: 60_000,
  })
}
