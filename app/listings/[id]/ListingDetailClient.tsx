'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import {
  MapPin, Users, Star, ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, X, LayoutGrid,
  Bed, Bath, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useListing } from '@/hooks/useListings'
import { useListingReviews, useReviewStats, useCreateReview } from '@/hooks/useReviews'
import { useGetUserByEmail } from '@/hooks/useAuth'
import { useSendMessage } from '@/hooks/useChat'
import { useBookings } from '@/hooks/useBookings'
import BookingWidget from '@/components/BookingWidget'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ListingMap = dynamic(() => import('@/components/ListingMap'), { ssr: false })

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶', kitchen: '🍳', parking: '🚗', pool: '🏊', gym: '💪',
  tv: '📺', ac: '❄️', washer: '🫧', dryer: '👕', workspace: '💻',
  hot_tub: '♨️', bbq: '🍖',
}

interface Props {
  id: string
}

export default function ListingDetailClient({ id }: Props) {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: listing, isLoading, error } = useListing(id)
  const { data: reviews, isLoading: reviewsLoading } = useListingReviews(id)
  const { data: reviewStats } = useReviewStats('LISTING', id)
  const { data: myBookings } = useBookings()
  const { mutateAsync: createReview, isPending: submittingReview } = useCreateReview()
  const { mutateAsync: sendMessage, isPending: startingChat } = useSendMessage()
  const { data: hostUser } = useGetUserByEmail(listing?.hostId ?? '')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mobilePhotoIndex, setMobilePhotoIndex] = useState(0)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const completedBooking = myBookings?.find((b) => b.listingId === id && b.status === 'COMPLETED')
  const alreadyReviewed = reviews?.some((r) => r.reviewerId === user?.email)

  const openLightbox = useCallback((index: number) => { setLightboxIndex(index); setLightboxOpen(true) }, [])
  const closeLightbox = useCallback(() => setLightboxOpen(false), [])
  const prevPhoto = useCallback((e: React.MouseEvent, total: number) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + total) % total) }, [])
  const nextPhoto = useCallback((e: React.MouseEvent, total: number) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % total) }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const handleSubmitReview = async () => {
    if (!completedBooking) return
    try {
      await createReview({ bookingId: completedBooking.id, listingId: id, revieweeId: listing?.hostId, ratingOverall: reviewRating, comment: reviewComment })
      setReviewSubmitted(true)
      toast.success('Review submitted!')
    } catch {
      toast.error('Failed to submit review.')
    }
  }

  const handleContactHost = async () => {
    if (!listing) return
    try {
      const res = await sendMessage({ recipientEmail: listing.hostId, listingId: listing.id, content: `Hi! I'm interested in ${listing.title}.` })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/messages/${(res as any).conversationId}`)
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
            {reviewStats?.count ? `${reviewStats.averageRating.toFixed(2)} · ${reviewStats.count} review${reviewStats.count !== 1 ? 's' : ''}` : 'New'}
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

      {/* Photo gallery */}
      <div className="mb-8">
        {/* Mobile: swipeable */}
        <div className="md:hidden relative rounded-2xl overflow-hidden aspect-[4/3]">
          <Image src={photos[mobilePhotoIndex]} alt={listing.title} fill className="object-cover" sizes="100vw" priority />
          {photos.length > 1 && (
            <>
              <button onClick={() => setMobilePhotoIndex((i) => (i - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-md">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setMobilePhotoIndex((i) => (i + 1) % photos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/90 rounded-full shadow-md">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                {mobilePhotoIndex + 1} / {photos.length}
              </div>
            </>
          )}
          <button onClick={() => openLightbox(mobilePhotoIndex)} className="absolute bottom-3 left-3 bg-card text-foreground text-xs font-semibold px-3 py-1.5 rounded-xl shadow border border-border flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />All photos
          </button>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid relative grid-cols-2 gap-2 rounded-2xl overflow-hidden max-h-[500px]">
          <div className="relative row-span-2 col-span-1 cursor-pointer group" onClick={() => openLightbox(0)}>
            <Image src={photos[0]} alt={listing.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="50vw" priority />
          </div>
          {photos.slice(1, 5).map((photo, i) => (
            <div key={i} className="relative aspect-[4/3] cursor-pointer group" onClick={() => openLightbox(i + 1)}>
              <Image src={photo} alt={`${listing.title} photo ${i + 2}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="25vw" />
            </div>
          ))}
          {photos.length === 1 && (
            <>
              <div className="relative aspect-[4/3] bg-muted" /><div className="relative aspect-[4/3] bg-muted" />
            </>
          )}
          {photos.length > 1 && (
            <button onClick={() => openLightbox(0)} className="absolute bottom-4 right-4 bg-card border border-border text-foreground text-sm font-medium px-4 py-2 rounded-xl shadow-md hover:bg-muted transition-colors flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />Show all {photos.length} photos
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <X className="h-6 w-6" />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
            {lightboxIndex + 1} / {photos.length}
          </div>
          {photos.length > 1 && (
            <button onClick={(e) => prevPhoto(e, photos.length)} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16" onClick={(e) => e.stopPropagation()}>
            <Image src={photos[lightboxIndex]} alt={`${listing.title} ${lightboxIndex + 1}`} fill className="object-contain" sizes="100vw" />
          </div>
          {photos.length > 1 && (
            <button onClick={(e) => nextPhoto(e, photos.length)} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {photos.map((photo, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }} className={cn('relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all', i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75')}>
                  <Image src={photo} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Host info */}
          <div className="flex items-center justify-between pb-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold capitalize">
                {listing.type} hosted by {hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : 'a local host'}
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
                  {hostUser ? hostUser.firstName?.[0] : 'H'}
                </AvatarFallback>
              </Avatar>
              <button onClick={handleContactHost} disabled={startingChat} className="text-xs text-primary font-medium hover:underline disabled:opacity-50">
                Contact Host
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pb-6 border-b border-border">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium">Superhost</p>
                <p className="text-sm text-muted-foreground">Superhosts are experienced, highly rated hosts.</p>
              </div>
            </div>
            {listing.instantBook && (
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-medium">Instant Book</p>
                  <p className="text-sm text-muted-foreground">Book without waiting for the host to respond.</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <span className="text-2xl">🔑</span>
              <div>
                <p className="font-medium">Self check-in</p>
                <p className="text-sm text-muted-foreground">Check yourself in with the lockbox.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 border-b border-border">
            <h3 className="text-xl font-semibold mb-4">About this place</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
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

          {/* Location */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Where you&apos;ll be</h3>
            <p className="text-muted-foreground mb-3">
              <MapPin className="inline h-4 w-4 mr-1" />{listing.address}, {listing.city}, {listing.country}
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

          {/* Reviews */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 fill-foreground text-foreground" />
              {reviews?.length ? `${(reviews.reduce((a, r) => a + r.ratingOverall, 0) / reviews.length).toFixed(2)} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
            </h3>

            {reviewsLoading ? (
              <div className="animate-pulse space-y-4"><div className="h-16 bg-muted rounded-xl" /><div className="h-16 bg-muted rounded-xl" /></div>
            ) : reviews?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{review.reviewerId?.[0]?.toUpperCase() ?? 'G'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.reviewerId?.split('@')[0] ?? 'Guest'}</div>
                        <div className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
                      </div>
                    </div>
                    <div className="flex text-yellow-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('h-3.5 w-3.5', i < review.ratingOverall ? 'fill-yellow-400 text-yellow-400' : 'text-muted')} />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">This place doesn&apos;t have any reviews yet.</p>
            )}

            {user && completedBooking && !reviewSubmitted && !alreadyReviewed && (
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-base font-semibold mb-4">Share your experience</h4>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className={cn('text-2xl transition-transform hover:scale-110', star <= reviewRating ? 'text-yellow-400' : 'text-muted')}>★</button>
                  ))}
                </div>
                <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="What did you love about this place?" rows={3} className="mb-3" />
                <Button onClick={handleSubmitReview} disabled={submittingReview || !reviewComment.trim()} size="sm">
                  {submittingReview ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : 'Submit Review'}
                </Button>
              </div>
            )}
            {user && completedBooking && (reviewSubmitted || alreadyReviewed) && (
              <div className="mt-6 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />Your review has been submitted. Thank you!
              </div>
            )}
          </div>
        </div>

        {/* Booking widget */}
        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border px-4 py-3 flex items-center justify-between" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div>
          <span className="text-xl font-bold">${listing.pricePerNight}</span>
          <span className="text-muted-foreground text-sm"> / night</span>
          {reviewStats?.count > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span>{reviewStats.averageRating.toFixed(1)} · {reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''}</span>
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
