'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { Listing } from '@/types'
import { useReviewStats } from '@/hooks/useReviews'
import useWishlistStore from '@/store/wishlistStore'
import useAuthStore from '@/store/authStore'
import { cn } from '@/lib/utils'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=75&auto=format&fit=crop'
const BLUR_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

interface ListingCardProps {
  listing: Listing
  priority?: boolean
}

const ListingCard = React.memo(function ListingCard({ listing, priority = false }: ListingCardProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
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
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
          {!imgLoaded && <div className="absolute inset-0 img-shimmer" />}
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className={cn(
              'object-cover transition-all duration-300 group-hover:scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            )}
            sizes="(max-width: 640px) 192px, 220px"
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
          />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(listing.id) }}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-3.5 w-3.5', isFavorited ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
          {listing.instantBook && (
            <span className="absolute top-2 left-2 bg-card/90 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow">
              Instant Book
            </span>
          )}
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-start gap-1">
            <h3 className="text-sm font-semibold text-foreground truncate flex-1 leading-tight">
              {listing.type} in {listing.city}
            </h3>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-xs font-medium">
                {reviewStats?.totalReviews ? reviewStats.averageRating?.toFixed(2) : 'New'}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{listing.title}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            ${listing.pricePerNight}
            <span className="font-normal text-muted-foreground text-xs"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  )
}, (prev, next) => prev.listing.id === next.listing.id && prev.priority === next.priority)

export default ListingCard
