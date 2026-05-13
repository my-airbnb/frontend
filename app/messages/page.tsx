'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMessageSquare, FiUser } from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useConversations } from '@/hooks/useChat'
import { formatDistanceToNow, parseISO } from 'date-fns'

export default function MessagesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { data: conversations, isLoading } = useConversations()

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-2xl p-4 h-24" />
          ))}
        </div>
      ) : !conversations || conversations.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
          <FiMessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages yet</h3>
          <p className="text-gray-500">
            When you contact hosts or guests, your messages will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conv) => {
              // Determine the other participant's email based on the current user
              const otherEmail = conv.hostEmail === user.email ? conv.guestEmail : conv.hostEmail
              
              return (
                <li key={conv.id}>
                  <Link
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors relative"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <FiUser className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {otherEmail.split('@')[0]}
                        </h3>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDistanceToNow(parseISO(conv.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'Click to view conversation...'}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
