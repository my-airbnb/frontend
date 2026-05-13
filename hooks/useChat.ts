import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Conversation, Message, CreateMessagePayload } from '@/types'

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      const response = await apiClient.get<Conversation[]>('/conversations')
      return Array.isArray(response.data) ? response.data : []
    },
  })
}

export const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<Message[]> => {
      const response = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`)
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!conversationId,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateMessagePayload): Promise<Message> => {
      const response = await apiClient.post<Message>(`/conversations/message`, payload)
      return response.data
    },
    onSuccess: (_, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
