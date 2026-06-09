'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Send, LayoutGrid, Loader as Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { useConcierge, type ConciergeCard } from '@/hooks/useConcierge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  cards?: ConciergeCard[]
}

const SUGGESTIONS = [
  'A weekend in Rome with a cooking class',
  'Somewhere sunny where I can go paragliding',
  'A cabin in the mountains plus a jeep tour',
  'Beach apartment in Barcelona for 4 guests',
]

function CardRow({ cards }: { cards: ConciergeCard[] }) {
  if (!cards?.length) return null
  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <Link key={`${c.kind}:${c.id}`} href={c.href}
          className="group rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
          <div className="relative aspect-[4/3] bg-muted">
            {c.photo && (
              <Image src={c.photo} alt={c.title} fill sizes="200px"
                className="object-cover group-hover:scale-105 transition-transform" />
            )}
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-background/85 px-1.5 py-0.5 rounded">
              {c.kind}
            </span>
          </div>
          <div className="p-2">
            <p className="text-sm font-medium line-clamp-1">{c.title}</p>
            {c.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{c.subtitle}</p>}
            {c.price != null && (
              <p className="text-xs mt-0.5"><span className="font-semibold">${c.price.toLocaleString()}</span>
                {c.priceUnit ? <span className="text-muted-foreground"> / {c.priceUnit}</span> : null}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const concierge = useConcierge()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, concierge.isPending])

  const send = (text: string) => {
    const msg = text.trim()
    if (!msg || concierge.isPending) return
    setInput('')
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: msg }])
    concierge.mutate(
      { sessionId, message: msg },
      {
        onSuccess: (res) => {
          setSessionId(res.sessionId)
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: res.reply, cards: res.cards }])
        },
        onError: () => {
          setMessages((m) => [...m, {
            id: crypto.randomUUID(), role: 'assistant',
            text: "Sorry — I had trouble reaching the assistant just now. Please try again.",
          }])
        },
      }
    )
  }

  const empty = messages.length === 0

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border px-4 h-14 flex items-center justify-between">
        <Logo />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/"><LayoutGrid className="h-4 w-4 mr-2" />Classic view</Link>
        </Button>
      </header>

      {/* Conversation */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {empty ? (
            <div className="text-center mt-10 sm:mt-20">
              <div className="inline-flex p-3 rounded-2xl bg-primary text-primary-foreground mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Tell me about your trip</h1>
              <p className="text-muted-foreground mb-6">
                Describe what you want — a place to stay, things to do — and I&apos;ll find the best real matches.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 text-left">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-sm rounded-xl border border-border px-4 py-3 hover:bg-muted transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : ''}>
                  <div className={m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]'
                    : 'w-full'}>
                    <p className="whitespace-pre-line text-sm leading-relaxed">{m.text}</p>
                    {m.role === 'assistant' && m.cards && <CardRow cards={m.cards} />}
                  </div>
                </div>
              ))}
              {concierge.isPending && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background">
        <form onSubmit={(e) => { e.preventDefault(); send(input) }}
          className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Describe your ideal trip…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-h-32"
          />
          <Button type="submit" size="icon" disabled={concierge.isPending || !input.trim()} className="shrink-0 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
