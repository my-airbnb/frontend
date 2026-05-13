'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { FiMapPin, FiUsers, FiStar, FiArrowLeft, FiCheckCircle, FiChevronLeft, FiChevronRight, FiX, FiGrid } from 'react-icons/fi'
import { MdBed, MdBathtub, MdKingBed } from 'react-icons/md'
import { useListing } from '@/hooks/useListings'
import { useListingReviews, useReviewStats, useCreateReview } from '@/hooks/useReviews'
import { useGetUserByEmail } from '@/hooks/useAuth'
import { useSendMessage } from '@/hooks/useChat'
import { useBookings } from '@/hooks/useBookings'
import BookingWidget from '@/components/BookingWidget'
import { useRouter } from 'next/navigation'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

const ListingMap = dynamic(() => import('@/components/ListingMap'), { ssr: false })

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

const AMENITY_ICONS: Record<string, string> = {
  wifi: '📶',
  kitchen: '🍳',
  parking: '🚗',
  pool: '🏊',
  gym: '💪',
  tv: '📺',
  ac: '❄️',
  washer: '🫧',
  dryer: '👕',
  workspace: '💻',
  hot_tub: '♨️',
  bbq: '🍖',
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
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  // Find a COMPLETED booking for this listing — only completed stays can be reviewed
  const completedBooking = myBookings?.find(
    (b) => b.listingId === id && b.status === 'COMPLETED'
  )

  // Check if the user already reviewed this listing (any booking for it)
  const alreadyReviewed = reviews?.some(
    (r) => r.reviewerId === user?.email
  )

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => setLightboxOpen(false), [])

  const prevPhoto = useCallback((e: React.MouseEvent, total: number) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i - 1 + total) % total)
  }, [])

  const nextPhoto = useCallback((e: React.MouseEvent, total: number) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i + 1) % total)
  }, [])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen])

  const handleSubmitReview = async () => {
    if (!completedBooking) return
    try {
      await createReview({
        bookingId: completedBooking.id,
        listingId: id,
        revieweeId: listing?.hostId,
        ratingOverall: reviewRating,
        comment: reviewComment,
      })
      setReviewSubmitted(true)
      toast.success('Review submitted!')
    } catch {
      toast.error('Failed to submit review.')
    }
  }

  const handleContactHost = async () => {
    if (!listing) return
    try {
      // Send an initial default message to trigger conversation creation
      const res = await sendMessage({
        recipientEmail: listing.hostId, // Note: hostId is actually the email based on the backend
        listingId: listing.id,
        content: `Hi! I'm interested in ${listing.title}.`
      })
      router.push(`/messages/${res.conversationId}`)
    } catch (err) {
      console.error('Failed to start conversation', err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <LoadingSkeleton count={1} />
        <div className="animate-pulse mt-8 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Listing not found</h2>
        <p className="text-gray-500 mb-6">This listing may no longer be available.</p>
        <Link href="/" className="btn-primary inline-block">
          Back to home
        </Link>
      </div>
    )
  }

  const photos =
    listing.photos && listing.photos.length > 0 ? listing.photos : [PLACEHOLDER_IMAGE]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <FiArrowLeft className="w-4 h-4" />
        All stays
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
        <div className="flex items-center gap-1">
          <FiStar className="w-4 h-4 text-gray-900 fill-gray-900" />
          <span className="font-medium text-gray-900">
            {reviewStats && reviewStats.count > 0
              ? `${reviewStats.averageRating.toFixed(2)} · ${reviewStats.count} review${reviewStats.count !== 1 ? 's' : ''}`
              : 'New'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <FiMapPin className="w-4 h-4" />
          <span>
            {listing.city}, {listing.country}
          </span>
        </div>
        {listing.instantBook && (
          <span className="flex items-center gap-1 text-secondary font-medium">
            <FiCheckCircle className="w-4 h-4" />
            Instant Book
          </span>
        )}
      </div>

      {/* Photo gallery */}
      <div className="relative grid grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-8 max-h-[500px]">
        {/* Main photo */}
        <div
          className="relative row-span-2 col-span-1 cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={photos[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        {/* Secondary photos */}
        {photos.slice(1, 5).map((photo, i) => (
          <div
            key={i}
            className="relative aspect-[4/3] cursor-pointer group"
            onClick={() => openLightbox(i + 1)}
          >
            <Image
              src={photo}
              alt={`${listing.title} photo ${i + 2}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="25vw"
            />
          </div>
        ))}
        {/* Fill with placeholder if fewer photos */}
        {photos.length === 1 && (
          <>
            <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-300 text-sm">No photo</span>
            </div>
            <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
              <span className="text-gray-300 text-sm">No photo</span>
            </div>
          </>
        )}
        {/* Show all photos button */}
        {photos.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-xl shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200"
          >
            <FiGrid className="w-4 h-4" />
            Show all {photos.length} photos
          </button>
        )}
      </div>

      {/* Lightbox modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => prevPhoto(e, photos.length)}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[lightboxIndex]}
              alt={`${listing.title} photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => nextPhoto(e, photos.length)}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    i === lightboxIndex ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                  }`}
                >
                  <Image src={photo} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host info */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {listing.type} hosted by {hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : 'a local host'}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FiUsers className="w-4 h-4" />
                  {listing.maxGuests} guests
                </span>
                <span className="flex items-center gap-1">
                  <MdKingBed className="w-4 h-4" />
                  {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <MdBed className="w-4 h-4" />
                  {listing.beds} bed{listing.beds !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <MdBathtub className="w-4 h-4" />
                  {listing.bathrooms} bath{listing.bathrooms !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {hostUser ? hostUser.firstName.charAt(0).toUpperCase() : 'H'}
              </div>
              <button
                onClick={handleContactHost}
                disabled={startingChat}
                className="text-xs text-primary font-medium hover:underline"
              >
                Contact Host
              </button>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pb-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium text-gray-900">Superhost</p>
                <p className="text-sm text-gray-500">
                  Superhosts are experienced, highly rated hosts who are committed to providing great stays.
                </p>
              </div>
            </div>
            {listing.instantBook && (
              <div className="flex items-start gap-4">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-medium text-gray-900">Instant Book</p>
                  <p className="text-sm text-gray-500">
                    Book without waiting for the host to respond.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-4">
              <span className="text-2xl">🔑</span>
              <div>
                <p className="font-medium text-gray-900">Self check-in</p>
                <p className="text-sm text-gray-500">
                  Check yourself in with the lockbox.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">About this place</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: listing.description }} />
          </div>

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-2 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-lg">
                      {AMENITY_ICONS[amenity.toLowerCase()] || '✓'}
                    </span>
                    <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Where you&apos;ll be</h3>
            <p className="text-gray-600 mb-3">
              <FiMapPin className="inline w-4 h-4 mr-1" />
              {listing.address}, {listing.city}, {listing.country}
            </p>
            {listing.lat && listing.lng ? (
              <ListingMap
                lat={listing.lat}
                lng={listing.lng}
                title={listing.title}
                address={`${listing.address}, ${listing.city}`}
              />
            ) : (
              <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FiMapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Location not available</p>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiStar className="w-5 h-5 fill-gray-900 text-gray-900" />
              {reviews && reviews.length > 0
                ? `${(reviews.reduce((acc, curr) => acc + (curr.ratingOverall ?? 0), 0) / reviews.length).toFixed(2)} · ${reviews.length} reviews`
                : 'No reviews (yet)'}
            </h3>
            
            {reviewsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-gray-100 rounded-xl" />
                <div className="h-16 bg-gray-100 rounded-xl" />
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                        {review.reviewerId?.charAt(0).toUpperCase() ?? 'G'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{review.reviewerId?.split('@')[0] ?? 'Guest'}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex text-yellow-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className={i < (review.ratingOverall ?? 0) ? 'fill-current' : 'text-gray-300'} />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">This place doesn't have any reviews yet.</p>
            )}

            {/* Review submission form for guests with a completed booking (and not yet reviewed) */}
            {user && completedBooking && !reviewSubmitted && !alreadyReviewed && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-base font-semibold text-gray-900 mb-4">Share your experience</h4>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you love about this place?"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none mb-3"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !reviewComment.trim()}
                  className="btn-primary disabled:opacity-50 text-sm px-6"
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            )}
            {user && completedBooking && (reviewSubmitted || alreadyReviewed) && (
              <div className="mt-6 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm font-medium">
                <FiCheckCircle className="w-4 h-4" />
                Your review has been submitted. Thank you!
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking widget */}
        <div className="lg:col-span-1">
          <BookingWidget listing={listing} />
        </div>
      </div>
    </div>
  )
}
