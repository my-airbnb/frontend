import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Review, CreateReviewPayload, ReviewStats } from '@/types'

export const useListingReviews = (listingId: string, initialData?: Review[]) => {
  return useQuery({
    queryKey: ['reviews', 'listing', listingId],
    queryFn: async ({ signal }): Promise<Review[]> => {
      const response = await apiClient.get<Review[]>(`/reviews/listing/${listingId}`, { signal })
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!listingId,
    initialData,
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

export const useReviewStats = (targetType: 'LISTING' | 'EXPERIENCE', targetId: string, initialData?: ReviewStats) => {
  const basePath = targetType === 'LISTING' ? 'listing' : 'experience'
  return useQuery({
    queryKey: ['review-stats', targetType, targetId],
    queryFn: async ({ signal }): Promise<ReviewStats> => {
      const response = await apiClient.get<ReviewStats>(
        `/reviews/${basePath}/${targetId}/stats`,
        { signal }
      )
      return response.data
    },
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData,
  })
}
