'use client'

import React, { useEffect, useState } from 'react'
import apiClient from '@/lib/axios'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import type { Suggestion } from '@/lib/server-api'
import SuggestionCard from './SuggestionCard'

/**
 * "Recommended for you" home strip. Personalized when the user is logged in
 * (the JWT drives collaborative filtering); falls back to popular listings for
 * anonymous/cold-start visitors. Fetched client-side because it depends on auth.
 */
export default function RecommendedForYou() {
  const hasHydrated = useHasHydrated()
  const { user } = useAuthStore()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    let active = true
    apiClient
      .get<Suggestion[]>('/suggestions/personalized', { params: { limit: 12 } })
      .then((res) => {
        if (active) setSuggestions(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {
        if (active) setSuggestions([])
      })
      .finally(() => {
        if (active) setLoaded(true)
      })
    return () => {
      active = false
    }
  }, [hasHydrated, user?.id])

  if (!loaded || suggestions.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold text-foreground mb-1">
        {user ? 'Recommended for you' : 'Popular right now'}
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        {user ? 'Based on stays guests like you booked' : 'Most-booked places on Airbnb'}
      </p>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>
    </section>
  )
}
