"use client"

import { useState, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import useWishlistStore from "@/store/wishlistStore"

interface PropertyCardProps {
  id: string
  listingId: string
  title: string
  location: string
  images: string[]
  price: number
  rating: number
  reviewCount: number
  dates?: string
  isSuperhost?: boolean
}

export const PropertyCard = memo(function PropertyCard({
  id,
  listingId,
  title,
  location,
  images,
  price,
  rating,
  reviewCount,
  dates,
  isSuperhost = false,
}: PropertyCardProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [showNav, setShowNav] = useState(false)
  const { toggle, isWishlisted } = useWishlistStore()
  const isFavorite = isWishlisted(listingId)

  const nextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(listingId)
  }, [listingId, toggle])

  return (
    <Link href={`/listings/${id}`}>
      <article
        className="group"
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => setShowNav(false)}
        onTouchStart={() => setShowNav(true)}
      >
        {/* Image Carousel */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          <Image
            src={images[currentImage]}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={toggleFavorite}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                isFavorite ? "fill-destructive text-destructive" : "text-foreground"
              )}
            />
          </Button>

          {/* Superhost Badge */}
          {isSuperhost && (
            <div className="absolute left-3 top-3 rounded-full bg-card px-2 py-1 text-xs font-medium shadow-sm">
              Superhost
            </div>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && showNav && (
            <>
              {currentImage > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-card/90 hover:bg-card shadow-md"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {currentImage < images.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-card/90 hover:bg-card shadow-md"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    idx === currentImage ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1">{title}</h3>
            {rating > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-medium">{rating.toFixed(2)}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{location}</p>
          {dates && <p className="text-sm text-muted-foreground">{dates}</p>}
          <p className="mt-1">
            <span className="font-semibold text-foreground">${price}</span>
            <span className="text-muted-foreground"> night</span>
          </p>
        </div>
      </article>
    </Link>
  )
})
