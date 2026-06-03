import type { Listing, Review, ReviewStats } from '@/types'

const LISTING_URL = process.env.LISTING_SERVICE_URL ?? 'http://service-listing:8082'
const REVIEW_URL = process.env.REVIEW_SERVICE_URL ?? 'http://service-review:8086'
const SUGGESTION_URL = process.env.SUGGESTION_SERVICE_URL ?? 'http://service-suggestion:8087'

export interface Suggestion {
  id: string
  city: string
  type: string
  price: number
  title: string
  photo: string
  reason: string
}

export interface ListingsPage {
  content: Listing[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

async function safeFetch<T>(url: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export async function serverFetchListing(id: string): Promise<Listing | null> {
  return safeFetch<Listing>(`${LISTING_URL}/api/v1/listings/${id}`)
}

export async function serverFetchListingsPage(
  filters: { city?: string; type?: string } = {},
  page = 0,
  size = 12,
): Promise<ListingsPage | null> {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (filters.city) params.set('city', filters.city)
  if (filters.type) params.set('type', filters.type)
  const data = await safeFetch<ListingsPage | Listing[]>(
    `${LISTING_URL}/api/v1/listings?${params}`,
  )
  if (!data) return null
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length }
  }
  return data
}

export async function serverFetchCities(): Promise<string[]> {
  const data = await safeFetch<string[]>(`${LISTING_URL}/api/v1/listings/cities`, 300)
  return data ?? []
}

export async function serverFetchReviews(listingId: string): Promise<Review[]> {
  const data = await safeFetch<Review[]>(`${REVIEW_URL}/api/v1/reviews/listing/${listingId}`)
  return Array.isArray(data) ? data : []
}

export async function serverFetchReviewStats(listingId: string): Promise<ReviewStats | null> {
  return safeFetch<ReviewStats>(`${REVIEW_URL}/api/v1/reviews/listing/${listingId}/stats`)
}

export async function serverFetchSuggestions(listingId: string, limit = 8): Promise<Suggestion[]> {
  const data = await safeFetch<Suggestion[]>(
    `${SUGGESTION_URL}/api/v1/suggestions/listing/${listingId}?limit=${limit}`,
  )
  return Array.isArray(data) ? data : []
}
