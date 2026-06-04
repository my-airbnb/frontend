'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Users, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { cn } from '@/lib/utils'
import type { Experience } from '@/types'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'arts', label: 'Arts' },
  { id: 'tours', label: 'Tours' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'sports', label: 'Sports' },
]

const PLACEHOLDER = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'

function formatDuration(minutes?: number) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function ExperiencesSection() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})

  const { data: experiences = [], isLoading, isError } = useQuery({
    queryKey: ['experiences'],
    queryFn: async (): Promise<Experience[]> => {
      const res = await apiClient.get<Experience[]>('/experiences')
      return Array.isArray(res.data) ? res.data : []
    },
    staleTime: 5 * 60 * 1000,
  })

  const filtered = experiences.filter(
    (exp) => activeCategory === 'all' || exp.category?.toLowerCase() === activeCategory,
  )

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold text-foreground mb-1">Experiences</h2>
      <p className="text-sm text-muted-foreground mb-5">Unique activities hosted by locals around the world</p>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeCategory === c.id
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:bg-muted',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-muted-foreground">Could not load experiences. Please try again.</p>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No experiences in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {filtered.map((exp) => (
            <Link key={exp.id} href={`/experiences/${exp.id}`} className="group block">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <Image
                  src={imgErrors[exp.id] ? PLACEHOLDER : exp.photos?.[0] || PLACEHOLDER}
                  alt={exp.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  onError={() => setImgErrors((p) => ({ ...p, [exp.id]: true }))}
                />
                <span className="absolute top-2 left-2 bg-card/90 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow capitalize">
                  {exp.category}
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{exp.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{exp.location}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(exp.durationMinutes)}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Up to {exp.maxGroupSize}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  ${Math.round(exp.pricePerPerson)}
                  <span className="font-normal text-muted-foreground text-xs"> / person</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
