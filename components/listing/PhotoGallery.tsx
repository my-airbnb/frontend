'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PhotoGalleryProps {
  photos: string[]
  title: string
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mobilePhotoIndex, setMobilePhotoIndex] = useState(0)

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
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i - 1 + photos.length) % photos.length)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i + 1) % photos.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, photos.length])

  return (
    <>
      {/* Mobile: swipeable */}
      <div className="md:hidden relative rounded-2xl overflow-hidden aspect-[4/3]">
        <Image src={photos[mobilePhotoIndex]} alt={title} fill className="object-cover" sizes="100vw" priority />
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
          <Image src={photos[0]} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="50vw" priority />
        </div>
        {photos.slice(1, 5).map((photo, i) => (
          <div key={i} className="relative aspect-[4/3] cursor-pointer group" onClick={() => openLightbox(i + 1)}>
            <Image src={photo} alt={`${title} photo ${i + 2}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="25vw" />
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
            <Image src={photos[lightboxIndex]} alt={`${title} ${lightboxIndex + 1}`} fill className="object-contain" sizes="100vw" />
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
    </>
  )
}
