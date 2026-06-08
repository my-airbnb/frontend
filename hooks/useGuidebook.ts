'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

export interface GuidebookTip {
  id: string
  category: string
  title: string
  description?: string
}

/** Public — the host's local tips for a listing, shown on the detail page. */
export function useGuidebook(listingId: string) {
  return useQuery({
    queryKey: ['guidebook', listingId],
    enabled: !!listingId,
    staleTime: 60_000,
    queryFn: async (): Promise<GuidebookTip[]> => {
      const res = await apiClient.get<GuidebookTip[]>(`/guidebook/listing/${listingId}`)
      return Array.isArray(res.data) ? res.data : []
    },
  })
}
