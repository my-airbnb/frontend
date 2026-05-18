import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Review, CreateReviewPayload } from '@/types'

export const useListingReviews = (listingId: string) => {
  return useQuery({
    queryKey: ['reviews', 'listing', listingId],
    queryFn: async (): Promise<Review[]> => {
      const response = await apiClient.get<Review[]>(`/reviews/listing/${listingId}`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!listingId,
  })
}

export const useCreateReview = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateReviewPayload): Promise<Review> => {
      const response = await apiClient.post<Review>('/reviews', payload)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'listing', variables.listingId] })
      queryClient.invalidateQueries({ queryKey: ['review-stats', 'LISTING', variables.listingId] })
    },
  })
}

export const useReviewStats = (_targetType: 'LISTING' | 'EXPERIENCE', targetId: string) => {
  return useQuery({
    queryKey: ['review-stats', _targetType, targetId],
    queryFn: async () => {
      const response = await apiClient.get<{ averageRating: number; count: number; listingId: string }>(
        `/reviews/listing/${targetId}/stats`
      )
      const data = response.data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { averageRating: data.averageRating ?? 0, count: (data as any).totalReviews ?? 0 }
    },
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  })
}
