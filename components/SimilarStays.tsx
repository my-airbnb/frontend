'use client'

import React from 'react'
import type { Suggestion } from '@/lib/server-api'
import SuggestionCard from './SuggestionCard'

/**
 * "Similar stays" strip on the listing detail page. Data is fetched server-side
 * and passed in, so it renders in the initial HTML (good for SEO + no spinner).
 */
export default function SimilarStays({ suggestions }: { suggestions: Suggestion[] }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-foreground mb-1">Similar stays</h2>
      <p className="text-sm text-muted-foreground mb-4">Places guests also booked</p>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} suggestion={s} />
        ))}
      </div>
    </section>
  )
}
