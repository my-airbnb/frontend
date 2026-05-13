'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSend, FiUser } from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useConversationMessages, useSendMessage, useConversations } from '@/hooks/useChat'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.conversationId as string
  const { user, isAuthenticated, token } = useAuthStore()
  const hasHydrated = useHasHydrated()

  const { data: initialMessages, isLoading: messagesLoading } = useConversationMessages(conversationId)
  const { data: conversations } = useConversations()
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage()

  const conversation = conversations?.find((c) => c.id === conversationId)
  const otherEmail = conversation 
    ? (conversation.hostEmail === user?.email ? conversation.guestEmail : conversation.hostEmail)
    : 'User'

  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const stompClientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.classList.add('no-footer')
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.classList.remove('no-footer')
    }
  }, [])

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
  }, [hasHydrated, isAuthenticated, router])

  // Sync initial messages from react-query to local state
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages)
    }
  }, [initialMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // STOMP over SockJS connection
  useEffect(() => {
    if (!isAuthenticated || !token || !conversationId) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${window.location.origin}/ws/chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/messages/${conversationId}`, (frame) => {
          try {
            const message = JSON.parse(frame.body)
            setMessages((prev) => {
              if (prev.find((m) => m.id === message.id)) return prev
              return [...prev, message]
            })
          } catch (err) {
            console.error('Failed to parse STOMP message', err)
          }
        })
        client.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({ conversationId }),
        })
      },
    })

    client.activate()
    stompClientRef.current = client

    return () => {
      client.deactivate()
    }
  }, [isAuthenticated, token, conversationId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    try {
      await sendMessage({
        conversationId,
        recipientEmail: otherEmail,
        content: newMessage,
      })
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  if (!hasHydrated || !isAuthenticated || !user) return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <Link href="/messages" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <FiArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <FiUser className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{otherEmail.split('@')[0]}</h1>
          <p className="text-xs text-gray-500">Conversation ID: {conversationId.substring(0, 8)}...</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2 custom-scrollbar">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === user.email
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                    isMe
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${
                      isMe ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {formatDistanceToNow(parseISO(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FiSend className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
