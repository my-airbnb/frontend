import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/axios'
import { Conversation, Message, CreateMessagePayload } from '@/types'
import useAuthStore from '@/store/authStore'

export const useConversations = () => {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async ({ signal }): Promise<Conversation[]> => {
      const response = await apiClient.get<Conversation[]>('/conversations', { signal })
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!user?.id,
  })
}

export const useConversationMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ signal }): Promise<Message[]> => {
      const response = await apiClient.get<Message[]>(`/conversations/${conversationId}/messages`, { signal })
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: !!conversationId,
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateMessagePayload): Promise<Message> => {
      const response = await apiClient.post<Message>('/conversations/message', payload)
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
