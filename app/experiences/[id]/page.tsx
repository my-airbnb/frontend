'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Experience } from '@/types'
import {
  FiClock, FiUsers, FiGlobe, FiMapPin, FiChevronLeft,
  FiChevronRight, FiX, FiCheck, FiShoppingBag, FiArrowLeft,
} from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useCreateBooking } from '@/hooks/useBookings'
import toast from 'react-hot-toast'

const ListingMap = dynamic(() => import('@/components/ListingMap'), { ssr: false })

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800'

export default function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { mutateAsync: createBooking, isPending: isBooking } = useCreateBooking()

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')

  const { data: experience, isLoading, error } = useQuery({
    queryKey: ['experience', id],
    queryFn: async (): Promise<Experience> => {
      const res = await apiClient.get<Experience>(`/experiences/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setLightboxIdx((i) => Math.min((experience?.photos.length ?? 1) - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, experience?.photos.length])

  const handleBook = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (!date) {
      toast.error('Please select a date')
      return
    }
    if (!experience) return
    try {
      const total = experience.pricePerPerson * guests
      // Experiences are single-day; checkOut must be after checkIn per booking service validation
      const checkOutDate = new Date(date)
      checkOutDate.setDate(checkOutDate.getDate() + 1)
      const checkOut = checkOutDate.toISOString().split('T')[0]
      const booking = await createBooking({
        experienceId: experience.id,
        type: 'EXPERIENCE',
        checkIn: date,
        checkOut,
        nbGuests: guests,
        totalPrice: total,
      })
      router.push(`/checkout/${booking.id}`)
    } catch {
      toast.error('Failed to book experience. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden h-72 mb-8">
          <div className="bg-gray-200" />
          <div className="bg-gray-200" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
        </div>
      </div>
    )
  }

  if (error || !experience) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Experience not found</h2>
        <Link href="/experiences" className="text-primary hover:underline">
          ← Back to experiences
        </Link>
      </div>
    )
  }

  const photos = experience.photos?.length ? experience.photos : [PLACEHOLDER_IMAGE]
  const durationH = Math.floor(experience.durationMinutes / 60)
  const durationM = experience.durationMinutes % 60
  const durationLabel = `${durationH > 0 ? `${durationH}h` : ''}${durationM > 0 ? ` ${durationM}m` : ''}`

  return (
    <>
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white p-2" onClick={() => setLightboxOpen(false)}>
            <FiX className="w-7 h-7" />
          </button>
          <button
            className="absolute left-4 text-white p-2 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.max(0, i - 1)) }}
            disabled={lightboxIdx === 0}
          >
            <FiChevronLeft className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightboxIdx]}
              alt={experience.title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            className="absolute right-4 text-white p-2 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx((i) => Math.min(photos.length - 1, i + 1)) }}
            disabled={lightboxIdx === photos.length - 1}
          >
            <FiChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 text-white text-sm">
            {lightboxIdx + 1} / {photos.length}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <FiArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{experience.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" />{experience.location}</span>
          <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{experience.category}</span>
        </div>

        {/* Photo gallery */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-10 cursor-pointer"
          style={{ maxHeight: 400 }}
        >
          {photos.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-gray-100 ${i === 0 ? 'col-span-2 row-span-2 sm:col-span-1' : ''}`}
              style={{ minHeight: i === 0 ? 240 : 120 }}
              onClick={() => { setLightboxIdx(i); setLightboxOpen(true) }}
            >
              <Image
                src={url}
                alt={`${experience.title} ${i + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {i === 2 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-lg">
                  +{photos.length - 3} more
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <FiClock className="w-5 h-5" />, label: 'Duration', value: durationLabel },
                { icon: <FiUsers className="w-5 h-5" />, label: 'Group size', value: `${experience.minGroupSize}–${experience.maxGroupSize}` },
                { icon: <FiGlobe className="w-5 h-5" />, label: 'Language', value: experience.language },
                { icon: <FiShoppingBag className="w-5 h-5" />, label: 'Price', value: `$${experience.pricePerPerson}/person` },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
                  <div className="text-gray-400">{item.icon}</div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this experience</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{experience.description}</p>
            </div>

            {/* What's included */}
            {experience.whatIncluded && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">What&apos;s included</h2>
                <ul className="space-y-2">
                  {experience.whatIncluded.split(',').map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* What to bring */}
            {experience.whatToBring && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">What to bring</h2>
                <ul className="space-y-2">
                  {experience.whatToBring.split(',').map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="text-gray-400 font-bold flex-shrink-0">·</span>
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Map */}
            {experience.lat && experience.lng && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Where you&apos;ll be</h2>
                <ListingMap
                  lat={experience.lat}
                  lng={experience.lng}
                  title={experience.title}
                  address={experience.location}
                />
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">${experience.pricePerPerson}</span>
                <span className="text-gray-500 text-sm"> / person</span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                    Guests
                  </label>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-3 py-2">
                    <button
                      onClick={() => setGuests((g) => Math.max(experience.minGroupSize, g - 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 disabled:opacity-30"
                      disabled={guests <= experience.minGroupSize}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">{guests}</span>
                    <button
                      onClick={() => setGuests((g) => Math.min(experience.maxGroupSize, g + 1))}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 disabled:opacity-30"
                      disabled={guests >= experience.maxGroupSize}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>${experience.pricePerPerson} × {guests} guest{guests > 1 ? 's' : ''}</span>
                  <span>${(experience.pricePerPerson * guests).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                  <span>Total</span>
                  <span>${(experience.pricePerPerson * guests).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={isBooking}
                className="w-full btn-primary py-3 text-sm font-semibold rounded-xl disabled:opacity-60"
              >
                {isBooking ? 'Booking...' : 'Reserve'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">You won&apos;t be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
