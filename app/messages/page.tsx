'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, User, Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useConversations } from '@/hooks/useChat'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatDistanceToNow, parseISO } from 'date-fns'

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { data: conversations, isLoading } = useConversations()

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.push('/login')
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated || !isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold mb-8">Messages</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-2xl p-4 h-24" />
              ))}
            </div>
          ) : !conversations?.length ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">When you contact hosts or guests, your messages will appear here.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <ul className="divide-y divide-border">
                {conversations.map((conv) => {
                  const otherEmail = conv.hostEmail === user.email ? conv.guestEmail : conv.hostEmail
                  return (
                    <li key={conv.id}>
                      <Link href={`/messages/${conv.id}`} className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors relative">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-base font-semibold truncate">{otherEmail.split('@')[0]}</h3>
                            {conv.lastMessageAt && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {formatDistanceToNow(parseISO(conv.lastMessageAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {conv.lastMessage || 'Click to view conversation...'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
