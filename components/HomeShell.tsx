'use client'

import { useState, type ReactNode } from 'react'
import { Home, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import ExperiencesSection from '@/components/ExperiencesSection'

/**
 * Home page shell with a top toggle between Stays and Experiences.
 * The Stays content (search + recommendations + listings) is server-rendered
 * and passed in as `staysSlot`; Experiences are fetched client-side on demand.
 */
export default function HomeShell({ staysSlot }: { staysSlot: ReactNode }) {
  const [tab, setTab] = useState<'stays' | 'experiences'>('stays')

  return (
    <>
      {/* Top toggle */}
      <div className="flex justify-center pt-6 pb-2">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            onClick={() => setTab('stays')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              tab === 'stays' ? 'bg-foreground text-background' : 'text-foreground hover:bg-muted',
            )}
            aria-pressed={tab === 'stays'}
          >
            <Home className="h-4 w-4" />Stays
          </button>
          <button
            onClick={() => setTab('experiences')}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              tab === 'experiences' ? 'bg-foreground text-background' : 'text-foreground hover:bg-muted',
            )}
            aria-pressed={tab === 'experiences'}
          >
            <Sparkles className="h-4 w-4" />Experiences
          </button>
        </div>
      </div>

      {/* Keep stays mounted (preserves SSR content + search state); just hide it */}
      <div className={tab === 'stays' ? 'block' : 'hidden'}>{staysSlot}</div>
      {tab === 'experiences' && <ExperiencesSection />}
    </>
  )
}
