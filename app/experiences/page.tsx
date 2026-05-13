'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Experience } from '@/types'
import { FiClock, FiUsers, FiSearch } from 'react-icons/fi'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Food & Drink', value: 'food' },
  { label: 'Outdoor', value: 'outdoor' },
  { label: 'Arts', value: 'arts' },
  { label: 'Tours', value: 'tours' },
  { label: 'Wellness', value: 'wellness' },
  { label: 'Sports', value: 'sports' },
]

function ExperienceCard({ exp }: { exp: Experience }) {
  const [imgError, setImgError] = useState(false)
  const photoUrl = exp.photos && exp.photos.length > 0 && !imgError ? exp.photos[0] : PLACEHOLDER_IMAGE

  return (
    <Link href={`/experiences/${exp.id}`} className="group block">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
        <Image
          src={photoUrl}
          alt={exp.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => setImgError(true)}
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full shadow capitalize">
          {exp.category}
        </div>
      </div>
      <div className="px-1 space-y-1">
        <h3 className="font-semibold text-gray-900 truncate">{exp.title}</h3>
        <p className="text-sm text-gray-500 truncate">{exp.location}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {Math.floor(exp.durationMinutes / 60)}h
            {exp.durationMinutes % 60 > 0 ? ` ${exp.durationMinutes % 60}m` : ''}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers className="w-3 h-3" />
            Up to {exp.maxGroupSize}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          <span className="text-base">${exp.pricePerPerson}</span>
          <span className="font-normal text-gray-500"> / person</span>
        </p>
      </div>
    </Link>
  )
}

export default function ExperiencesPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  const { data: experiences, isLoading, error } = useQuery({
    queryKey: ['experiences'],
    queryFn: async (): Promise<Experience[]> => {
      const response = await apiClient.get<Experience[]>('/experiences')
      return Array.isArray(response.data) ? response.data : []
    },
    staleTime: 60_000,
  })

  const filtered = (experiences || []).filter(Boolean).filter((exp) => {
    const matchesSearch = !search || exp.title?.toLowerCase().includes(search.toLowerCase()) || exp.location?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || exp.category?.toLowerCase().includes(activeCategory)
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Experiences</h1>
        <p className="text-gray-500">Unique activities hosted by locals around the world.</p>
      </div>

      {/* Search + Category filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton count={8} />
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-500">Could not load experiences. Please try again.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No experiences found</h3>
          <p className="text-gray-500">Try a different search or category.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">{filtered.length} experience{filtered.length !== 1 ? 's' : ''} available</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((exp) => (
              <ExperienceCard key={exp.id} exp={exp} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
