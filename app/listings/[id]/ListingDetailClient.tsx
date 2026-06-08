'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { MapPin, Users, Star, ArrowLeft, CircleCheck as CheckCircle, Bed, Bath, Loader as Loader2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useListing } from '@/hooks/useListings'
import { useListingReviews, useReviewStats } from '@/hooks/useReviews'
import type { Listing, Review, ReviewStats } from '@/types'
import { useGetUserByEmail } from '@/hooks/useAuth'
import { useSendMessage } from '@/hooks/useChat'
import { useBookings } from '@/hooks/useBookings'
import { useRecordView } from '@/hooks/useRecentlyViewed'
import { useGuidebook } from '@/hooks/useGuidebook'
import QASection from '@/components/listing/QASection'
import BookingWidget from '@/components/BookingWidget'
import PhotoGallery from '@/components/listing/PhotoGallery'
import ReviewsSection from '@/components/listing/ReviewsSection'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { stripHtml } from '@/lib/api-utils'

const ListingMap = dynamic(() => import('@/components/ListingMap'), { ssr: false })

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶', kitchen: '🍳', parking: '🚗', pool: '🏊', gym: '💪',
  tv: '📺', ac: '❄️', washer: '🫧', dryer: '👕', workspace: '💻',
  hot_tub: '♨️', bbq: '🍖',
}

interface Props {
  id: string
  initialListing?: Listing
  initialReviews?: Review[]
  initialReviewStats?: ReviewStats
}

export default function ListingDetailClient({ id, initialListing, initialReviews, initialReviewStats }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: listing, isLoading, error } = useListing(id, initialListing)
  const { data: reviews, isLoading: reviewsLoading } = useListingReviews(id, initialReviews)
  const { data: reviewStats } = useReviewStats('LISTING', id, initialReviewStats)
  const { data: myBookings } = useBookings()
  const { mutateAsync: sendMessage, isPending: startingChat } = useSendMessage()
  const { data: hostUser, isLoading: hostLoading } = useGetUserByEmail(listing?.hostId ?? '')
  const recordView = useRecordView()
  const { data: guidebook = [] } = useGuidebook(id)

  // Record this view (for the "Continue exploring" row) when logged in.
  useEffect(() => {
    if (user && id) recordView.mutate(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id])

  const completedBooking = myBookings?.find((b) => b.listingId === id && b.status === 'COMPLETED')

  const handleContactHost = async () => {
    if (!listing) return
    if (!user) { router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`); return }
    // M4: prevent a host from messaging themselves
    if (user.email === listing.hostId) { toast.error("You can't message yourself."); return }
    try {
      const res = await sendMessage({ recipientEmail: listing.hostId, listingId: listing.id, content: `Hi! I'm interested in ${listing.title}.` })
      if (res.conversationId) {
        router.push(`/messages/${res.conversationId}`)
      } else {
        toast.error('Could not start conversation.')
      }
    } catch { toast.error('Failed to start conversation.') }
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )

  if (error || !listing) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-2xl font-semibold mb-2">Listing not found</h2>
      <p className="text-muted-foreground mb-6">This listing may no longer be available.</p>
      <Button asChild><Link href="/">Back to home</Link></Button>
    </div>
  )

  const photos = listing.photos?.length > 0 ? listing.photos : [PLACEHOLDER_IMAGE]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />All stays</Link>
      </Button>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="font-medium text-foreground">
            {reviewStats?.totalReviews && reviewStats.averageRating != null
              ? `${reviewStats.averageRating.toFixed(2)} · ${reviewStats.totalReviews} review${reviewStats.totalReviews !== 1 ? 's' : ''}`
              : 'New'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{listing.city}, {listing.country}</span>
        </div>
        {listing.instantBook && (
          <span className="flex items-center gap-1 text-primary font-medium">
            <CheckCircle className="h-4 w-4" />
            Instant Book
          </span>
        )}
      </div>

      <div className="mb-8">
        <PhotoGallery photos={photos} title={listing.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Host info */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {listing.type} hosted by{' '}
                {hostLoading ? (
                  <span className="inline-block w-32 h-6 bg-muted rounded animate-pulse align-middle" />
                ) : hostUser ? (
                  `${hostUser.firstName} ${hostUser.lastName}`
                ) : (
                  'a local host'
                )}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{listing.maxGuests} guests</span>
                <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{listing.beds} bed{listing.beds !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-14 w-14">
                <AvatarImage src={hostUser?.avatarUrl} />
                <AvatarFallback className="text-xl font-bold">
                  {hostLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : hostUser ? hostUser.firstName?.[0] : 'H'}
                </AvatarFallback>
              </Avatar>
              <button onClick={handleContactHost} disabled={startingChat} className="text-xs text-primary font-medium hover:underline disabled:opacity-50">
                Contact Host
              </button>
            </div>
          </div>

          {/* Highlights — only render when there is at least one to show */}
          {(listing.instantBook || listing.amenities?.some((a) => a.toLowerCase() === 'self_check_in')) && (
            <div className="space-y-4 pb-6 border-b border-border">
              {listing.instantBook && (
                <div className="flex items-start gap-4">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-medium">Instant Book</p>
                    <p className="text-sm text-muted-foreground">Book without waiting for the host to respond.</p>
                  </div>
                </div>
              )}
              {listing.amenities?.some((a) => a.toLowerCase() === 'self_check_in') && (
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <p className="font-medium">Self check-in</p>
                    <p className="text-sm text-muted-foreground">Check yourself in with the lockbox.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="pb-6 border-b border-border">
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {stripHtml(listing.description)}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="pb-6 border-b border-border">
              <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{AMENITY_ICONS[amenity.toLowerCase()] || '✓'}</span>
                    <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Things to know */}
          <div className="pb-6 border-b border-border">
            <h3 className="text-xl font-semibold mb-4">Things to know</h3>
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-medium mb-1">House rules</p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {listing.houseRules?.trim() || 'Check-in after 3 PM · Checkout before 11 AM · No parties or events'}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Cancellation policy</p>
                <p className="text-muted-foreground">
                  Free cancellation up to 48 hours before check-in. After that, the first night is non-refundable.
                </p>
              </div>
            </div>
          </div>

          {/* Host's guidebook */}
          {guidebook.length > 0 && (
            <div className="pb-6 border-b border-border">
              <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Host&apos;s guidebook
              </h3>
              <p className="text-muted-foreground text-sm mb-4">Local tips from your host</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {guidebook.map((tip) => (
                  <div key={tip.id} className="rounded-xl border border-border p-4">
                    {tip.category && (
                      <span className="inline-block text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        {tip.category}
                      </span>
                    )}
                    <p className="font-medium">{tip.title}</p>
                    {tip.description && (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{tip.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions & answers */}
          <QASection listingId={id} hostId={listing.hostId} />

          {/* Location */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Where you&apos;ll be</h3>
            <p className="text-muted-foreground mb-3">
              <MapPin className="inline h-4 w-4 mr-1" />
              {[listing.address, listing.city, listing.country]
                .filter(Boolean)
                .filter((part, i, arr) => !arr.slice(0, i).some((p) => p.toLowerCase() === part.toLowerCase()))
                .join(', ')}
            </p>
            {listing.lat && listing.lng ? (
              <ListingMap lat={listing.lat} lng={listing.lng} title={listing.title} address={`${listing.address}, ${listing.city}`} />
            ) : (
              <div className="bg-muted rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Location not available</p>
                </div>
              </div>
            )}
          </div>

          <ReviewsSection
            listingId={id}
            reviews={reviews}
            reviewStats={reviewStats}
            reviewsLoading={reviewsLoading}
            completedBooking={completedBooking}
            user={user}
            hostId={listing.hostId}
          />
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>

      {/* Mobile sticky booking bar — full-width, anchored to the bottom edge */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div>
          <span className="text-xl font-bold">${listing.pricePerNight}</span>
          <span className="text-muted-foreground text-sm"> / night</span>
          {reviewStats && reviewStats.totalReviews > 0 && reviewStats.averageRating != null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span>{reviewStats.averageRating.toFixed(1)} · {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <Button asChild size="lg" className="rounded-xl px-8">
          <a href="#booking-widget">Reserve</a>
        </Button>
      </div>
    </div>
  )
}
