'use client'

import { useQuery } from '@tanstack/react-query'
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
