'use client'

import { useMutation } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

export interface ConciergeCard {
  kind: 'stay' | 'experience'
  id: string
  title: string
  subtitle?: string
  price?: number
  priceUnit?: string
  photo?: string
  href: string
}

export interface ConciergeReply {
  sessionId: string
  reply: string
  cards: ConciergeCard[]
}

/** Send a message to the AI concierge; returns the grounded reply + result cards. */
export function useConcierge() {
  return useMutation({
    mutationFn: async (vars: { sessionId: string | null; message: string }): Promise<ConciergeReply> => {
      const res = await apiClient.post<ConciergeReply>('/concierge/chat', {
        sessionId: vars.sessionId ?? undefined,
        message: vars.message,
      })
      return res.data
    },
  })
}
