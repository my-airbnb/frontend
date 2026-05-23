import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ListingDetailClient from './ListingDetailClient'
import { serverFetchListing, serverFetchReviews, serverFetchReviewStats } from '@/lib/server-api'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const listing = await serverFetchListing(id)
  if (!listing) return {}
  return {
    title: `${listing.title} — Airbnb`,
    description: listing.description?.slice(0, 155),
    openGraph: {
      title: listing.title,
      description: listing.description?.slice(0, 155),
      images: listing.photos?.[0] ? [listing.photos[0]] : [],
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [listing, reviews, reviewStats] = await Promise.all([
    serverFetchListing(id),
    serverFetchReviews(id),
    serverFetchReviewStats(id),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ListingDetailClient
          id={id}
          initialListing={listing ?? undefined}
          initialReviews={reviews}
          initialReviewStats={reviewStats ?? undefined}
        />
      </main>
      <Footer />
    </div>
  )
}
