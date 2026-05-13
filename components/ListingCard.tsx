'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FaStar } from 'react-icons/fa'
import { Listing } from '@/types'
import { useReviewStats } from '@/hooks/useReviews'
import useWishlistStore from '@/store/wishlistStore'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'

interface ListingCardProps {
  listing: Listing
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const [imgError, setImgError] = useState(false)
  const { toggle, isWishlisted } = useWishlistStore()
  const isFavorited = isWishlisted(listing.id)
  const { data: reviewStats } = useReviewStats('LISTING', listing.id)

  const photoUrl =
    listing.photos && listing.photos.length > 0 && !imgError
      ? listing.photos[0]
      : PLACEHOLDER_IMAGE

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(listing.id)
  }

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative">
        {/* Image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <Image
            src={photoUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImgError(true)}
          />
          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 z-10 p-1 transition-transform hover:scale-110"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? (
              <AiFillHeart className="w-6 h-6 text-primary drop-shadow-md" />
            ) : (
              <AiOutlineHeart className="w-6 h-6 text-white drop-shadow-md" />
            )}
          </button>

          {/* Instant Book badge */}
          {listing.instantBook && (
            <span className="absolute top-3 left-3 bg-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              Instant Book
            </span>
          )}
        </div>

        {/* Details */}
        <div className="mt-3 px-1">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 truncate pr-2 flex-1">
              {listing.city}, {listing.country}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <FaStar className="w-3 h-3 text-gray-900" />
              <span className="text-sm font-medium text-gray-900">
                {reviewStats && reviewStats.count > 0
                  ? reviewStats.averageRating.toFixed(1)
                  : 'New'}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-0.5 truncate">{listing.title}</p>

          <p className="text-sm text-gray-500 capitalize">{listing.type}</p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            <span className="text-base">${listing.pricePerNight}</span>
            <span className="font-normal text-gray-500"> / night</span>
          </p>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard
