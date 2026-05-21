import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://airbb.serghini.me'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/experiences`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/wishlists`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]
}
