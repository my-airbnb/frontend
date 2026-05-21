import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ListingDetailClient from './ListingDetailClient'

const API_BASE = process.env.INTERNAL_API_URL ?? 'http://service-listing:8080'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id } = await params
    const res = await fetch(`${API_BASE}/api/v1/listings/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) return {}
    const listing = await res.json()
    return {
      title: `${listing.title} — Airbnb`,
      description: listing.description?.slice(0, 155),
      openGraph: {
        title: listing.title,
        description: listing.description?.slice(0, 155),
        images: listing.photos?.[0] ? [listing.photos[0]] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ListingDetailClient id={id} />
      </main>
      <Footer />
    </div>
  )
}
