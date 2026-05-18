'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, User, Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useConversationMessages, useSendMessage, useConversations } from '@/hooks/useChat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { Message } from '@/types'

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

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const stompClientRef = useRef<Client | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.push('/login')
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
            setMessages((prev) => prev.find((m) => m.id === message.id) ? prev : [...prev, message])
          } catch {}
        })
        client.publish({ destination: '/app/chat.join', body: JSON.stringify({ conversationId }) })
      },
    })
    client.activate()
    stompClientRef.current = client
    return () => { client.deactivate() }
  }, [isAuthenticated, token, conversationId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return
    try {
      await sendMessage({ conversationId, recipientEmail: otherEmail, content: newMessage })
      setNewMessage('')
    } catch {}
  }

  if (!hasHydrated || !isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/messages"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold">{otherEmail.split('@')[0]}</h1>
          <p className="text-xs text-muted-foreground">Conversation {conversationId.substring(0, 8)}...</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">No messages yet. Send a message to start!</div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === user.email
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(parseISO(msg.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-border">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-full" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
