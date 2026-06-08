'use client'

import { use, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Calendar } from '@/components/ui/calendar'
import { useUnavailableDates, useBlockDates, useUnblockDates } from '@/hooks/useAvailability'

const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const fromIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export default function ManageAvailabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: blocked = [], isLoading } = useUnavailableDates(id)
  const block = useBlockDates(id)
  const unblock = useUnblockDates(id)

  const blockedDates = useMemo(() => blocked.map(fromIso), [blocked])
  const blockedSet = useMemo(() => new Set(blocked), [blocked])

  const onDayClick = (day: Date) => {
    if (day < new Date(new Date().toDateString())) return // ignore past
    const iso = toIso(day)
    if (blockedSet.has(iso)) unblock.mutate([iso])
    else block.mutate([iso])
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold text-foreground">Manage availability</h1>
        <p className="mt-2 text-muted-foreground">
          Tap a date to block it for guests; tap a blocked date to open it back up.
          Blocked dates are greyed out in the booking calendar.
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Calendar
              mode="single"
              onDayClick={onDayClick}
              numberOfMonths={1}
              modifiers={{ blocked: blockedDates }}
              modifiersClassNames={{ blocked: 'line-through text-destructive font-semibold' }}
              disabled={(date) => date < new Date(new Date().toDateString())}
            />
          )}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full border border-border" />Available</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-destructive/20 border border-destructive" />Blocked</span>
            {(block.isPending || unblock.isPending) && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving…</span>}
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {blocked.length === 0 ? 'No dates blocked — your listing is fully open.' : `${blocked.length} date${blocked.length === 1 ? '' : 's'} currently blocked.`}
        </p>
      </main>
      <Footer />
    </div>
  )
}
