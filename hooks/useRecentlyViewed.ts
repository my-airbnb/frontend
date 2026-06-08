'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import useAuthStore from '@/store/authStore'
import type { Listing } from '@/types'

/** Record that the signed-in user viewed a listing (fire-and-forget). */
export function useRecordView() {
  return useMutation({
    mutationFn: async (listingId: string) => {
      await apiClient.post(`/recently-viewed/me/items/${listingId}`)
    },
  })
}

/**
 * The user's recently viewed listings, hydrated with full listing data so they
 * can render as cards. Skips the current listing id if provided.
 */
export function useRecentlyViewed(excludeId?: string) {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['recently-viewed'],
    enabled: isAuthenticated,
    staleTime: 30_000,
    queryFn: async (): Promise<Listing[]> => {
      const res = await apiClient.get<{ listingIds: string[] }>('/recently-viewed/me')
      const ids = (res.data?.listingIds ?? []).filter((id) => id !== excludeId).slice(0, 10)
      if (ids.length === 0) return []
      const listings = await Promise.all(
        ids.map((id) =>
          apiClient.get<Listing>(`/listings/${id}`).then((r) => r.data).catch(() => null),
        ),
      )
      return listings.filter((l): l is Listing => !!l)
    },
  })
}
