import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Listing, ListingFilters, CreateListingPayload } from '@/types'
import { normalizeListingsResponse } from '@/lib/api-utils'

export interface ListingsPage {
  content: Listing[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

type ListingsResponse = ListingsPage

export function buildListingParams(filters?: ListingFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters?.city) params.append('city', filters.city)
  if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice))
  if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice))
  if (filters?.checkIn) params.append('checkIn', filters.checkIn)
  if (filters?.checkOut) params.append('checkOut', filters.checkOut)
  if (filters?.guests) params.append('guests', String(filters.guests))
  if (filters?.type) params.append('type', filters.type)
  return params
}

const useListings = (filters?: ListingFilters) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['listings', filters],
    queryFn: async ({ signal }) => {
      const params = buildListingParams(filters)
      const response = await apiClient.get<ListingsResponse | Listing[]>(
        `/listings?${params.toString()}`,
        { signal }
      )
      return normalizeListingsResponse(response.data)
    },
  })

  return {
    listings: data || [],
    isLoading,
    error,
    refetch,
  }
}

export const useCreateListing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateListingPayload): Promise<Listing> => {
      const response = await apiClient.post<Listing>('/listings', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['host-listings'] })
    },
  })
}

export const useListing = (id: string) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<Listing>(`/listings/${id}`, { signal })
      return response.data
    },
    enabled: !!id,
  })
}

export const useHostListings = () => {
  return useQuery({
    queryKey: ['host-listings'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<Listing[] | ListingsResponse>('/listings/host/me', { signal })
      return normalizeListingsResponse(response.data)
    },
  })
}

export const useListingSearch = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['listing-search', query],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<Listing[]>(`/listings/search?query=${encodeURIComponent(query)}`, { signal })
      return response.data || []
    },
    enabled: enabled && !!query && query.length > 1,
    staleTime: 30_000,
  })
}

export const useListingsInfinite = (filters?: ListingFilters) => {
  return useInfiniteQuery<ListingsPage>({
    queryKey: ['listings-infinite', filters],
    queryFn: async ({ pageParam, signal }) => {
      const params = buildListingParams(filters)
      params.append('page', String(pageParam ?? 0))
      params.append('size', '12')
      const response = await apiClient.get<ListingsPage | Listing[]>(`/listings?${params.toString()}`, { signal })
      if (Array.isArray(response.data)) {
        const arr = response.data as Listing[]
        return { content: arr, totalElements: arr.length, totalPages: 1, number: 0, size: arr.length }
      }
      return response.data as ListingsPage
    },
    getNextPageParam: (lastPage) =>
      lastPage.number < lastPage.totalPages - 1 ? lastPage.number + 1 : undefined,
    initialPageParam: 0,
  })
}

export const useUpdateListing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateListingPayload> }): Promise<Listing> => {
      const response = await apiClient.put<Listing>(`/listings/${id}`, payload)
      return response.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] })
      queryClient.invalidateQueries({ queryKey: ['host-listings'] })
    },
  })
}

export const useDeleteListing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/listings/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings'] })
      queryClient.invalidateQueries({ queryKey: ['listings-infinite'] })
    },
  })
}

export default useListings
