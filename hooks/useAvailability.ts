'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

/**
 * Host-blocked dates for a listing (ISO "yyyy-MM-dd" strings). Public read used
 * by the booking date picker to grey out unavailable days, on top of dates
 * already taken by bookings.
 */
export function useUnavailableDates(listingId: string) {
  return useQuery({
    queryKey: ['availability', listingId],
    queryFn: async (): Promise<string[]> => {
      const res = await apiClient.get<{ blockedDates: string[] }>(
        `/availability/listing/${listingId}`,
      )
      return Array.isArray(res.data?.blockedDates) ? res.data.blockedDates : []
    },
    enabled: !!listingId,
    staleTime: 60_000,
  })
}

/** Host: block one or more dates (ISO "yyyy-MM-dd") for a listing. */
export function useBlockDates(listingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dates: string[]) => {
      await apiClient.post(`/availability/listing/${listingId}/block`, { dates })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability', listingId] }),
  })
}

/** Host: free up previously blocked dates. */
export function useUnblockDates(listingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dates: string[]) => {
      await apiClient.delete(`/availability/listing/${listingId}/block`, { data: { dates } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['availability', listingId] }),
  })
}
