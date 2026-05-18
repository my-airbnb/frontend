'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, Star } from 'lucide-react'
import { Listing } from '@/types'
import { useReviewStats } from '@/hooks/useReviews'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

interface ListingCardProps {
  listing: Listing
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const [imgError, setImgError] = useState(false)
  const { user } = useAuthStore()
  const { toggle, isWishlisted, setactiveUser } = useWishlistStore()

  useEffect(() => {
    if (user?.id) setactiveUser(user.id)
  }, [user?.id, setactiveUser])
  const isFavorited = isWishlisted(listing.id)
  const { data: reviewStats } = useReviewStats('LISTING', listing.id)

  const photoUrl =
    listing.photos?.length > 0 && !imgError ? listing.photos[0] : PLACEHOLDER_IMAGE

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted">
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(listing.id) }}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4', isFavorited ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
          {listing.instantBook && (
            <span className="absolute top-3 left-3 bg-card text-xs font-semibold px-2 py-1 rounded-full shadow">
              Instant Book
            </span>
          )}
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-foreground truncate flex-1">
              {listing.city}, {listing.country}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              <span className="text-sm font-medium">
                {reviewStats?.totalReviews ? reviewStats.averageRating?.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{listing.title}</p>
          <p className="text-sm text-muted-foreground capitalize">{listing.type}</p>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            <span className="text-base">${listing.pricePerNight}</span>
            <span className="font-normal text-muted-foreground"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
