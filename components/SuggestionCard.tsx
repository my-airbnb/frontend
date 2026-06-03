'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Suggestion } from '@/lib/server-api'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=75&auto=format&fit=crop'
const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [imgError, setImgError] = useState(false)
  const photoUrl = suggestion.photo && !imgError ? suggestion.photo : PLACEHOLDER_IMAGE

  return (
    <Link href={`/listings/${suggestion.id}`} className="group block w-44 flex-shrink-0">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted">
        <Image
          src={photoUrl}
          alt={suggestion.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="176px"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onError={() => setImgError(true)}
        />
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold text-foreground truncate">
          {suggestion.type} in {suggestion.city}
        </h3>
        <p className="text-xs text-muted-foreground truncate">{suggestion.title}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          ${Math.round(suggestion.price)}
          <span className="font-normal text-muted-foreground text-xs"> / night</span>
        </p>
      </div>
    </Link>
  )
}

export default React.memo(SuggestionCard)
