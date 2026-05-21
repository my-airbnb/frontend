import { MetadataRoute } from 'next'

const BASE = 'https://airbb.serghini.me'
const API = process.env.INTERNAL_API_URL ?? 'http://service-listing:8080'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/experiences`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/wishlists`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    const res = await fetch(`${API}/api/v1/listings?page=0&size=500`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return staticRoutes
    const data = await res.json()
    const listings: { id: string; updatedAt?: string; createdAt?: string }[] =
      data.content ?? data ?? []
    const listingRoutes: MetadataRoute.Sitemap = listings.map((l) => ({
      url: `${BASE}/listings/${l.id}`,
      lastModified: l.updatedAt ?? l.createdAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    return [...staticRoutes, ...listingRoutes]
  } catch {
    return staticRoutes
  }
}
