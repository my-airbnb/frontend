'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'

export interface QaQuestion {
  id: string
  listingId: string
  askedBy: string
  askedByName: string
  question: string
  createdAt: string
  answer: string | null
  answeredBy: string | null
  answeredAt: string | null
}

export function useQa(listingId: string) {
  return useQuery({
    queryKey: ['qa', listingId],
    enabled: !!listingId,
    staleTime: 30_000,
    queryFn: async (): Promise<QaQuestion[]> => {
      const res = await apiClient.get<QaQuestion[]>(`/qa/listing/${listingId}`)
      return Array.isArray(res.data) ? res.data : []
    },
  })
}

export function useAskQuestion(listingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { question: string; askerName?: string }): Promise<QaQuestion> => {
      const res = await apiClient.post<QaQuestion>(`/qa/listing/${listingId}`, vars)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', listingId] }),
  })
}

export function useAnswerQuestion(listingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { questionId: string; answer: string }): Promise<QaQuestion> => {
      const res = await apiClient.post<QaQuestion>(`/qa/${vars.questionId}/answer`, { answer: vars.answer })
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qa', listingId] }),
  })
}
