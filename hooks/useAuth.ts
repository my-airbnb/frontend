'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/axios'
import useAuthStore from '@/store/authStore'
import { AuthResponse, User } from '@/types'

interface UpdateProfilePayload {
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
}

export const useUpdateProfile = () => {
  const { setAuth } = useAuthStore()
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload): Promise<User> => {
      const response = await apiClient.put<User>('/auth/me', payload)
      return response.data
    },
    onSuccess: (updatedUser) => {
      const { token, refreshToken } = useAuthStore.getState()
      if (token) setAuth(updatedUser, token, refreshToken ?? undefined)
    },
  })
}

export const useGetUserByEmail = (email: string) => {
  return useQuery({
    queryKey: ['user-by-email', email],
    queryFn: async ({ signal }): Promise<User> => {
      const response = await apiClient.get<User>(`/auth/users/by-email/${encodeURIComponent(email)}`, { signal })
      return response.data
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export const useBecomeHost = () => {
  const { setAuth } = useAuthStore()
  return useMutation({
    mutationFn: async (): Promise<User> => {
      const response = await apiClient.post<User>('/auth/become-host')
      return response.data
    },
    onSuccess: (updatedUser) => {
      const { token, refreshToken } = useAuthStore.getState()
      if (!token) return
      setAuth(updatedUser, token, refreshToken ?? undefined)
    },
  })
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

const fetchCurrentUser = async (token: string): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const useGoogleAuth = () => {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async ({ credential, redirectTo }: { credential: string; redirectTo: string }) => {
      const authRes = await apiClient.post<AuthResponse>('/auth/google', { credential })
      const { accessToken, refreshToken } = authRes.data
      const user = await fetchCurrentUser(accessToken)
      return { user, token: accessToken, refreshToken, redirectTo }
    },
    onSuccess: ({ user, token, refreshToken, redirectTo }) => {
      setAuth(user, token, refreshToken)
      router.push(redirectTo)
    },
  })
}

const useAuth = () => {
  const router = useRouter()
  const { setAuth, clearAuth } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async ({ payload, redirectTo }: { payload: LoginPayload; redirectTo: string }) => {
      const authRes = await apiClient.post<AuthResponse>('/auth/login', payload)
      const { accessToken, refreshToken } = authRes.data
      const user = await fetchCurrentUser(accessToken)
      return { user, token: accessToken, refreshToken, redirectTo }
    },
    onSuccess: ({ user, token, refreshToken, redirectTo }) => {
      setAuth(user, token, refreshToken)
      router.push(redirectTo)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async ({ payload, redirectTo }: { payload: RegisterPayload; redirectTo: string }) => {
      const authRes = await apiClient.post<AuthResponse>('/auth/register', payload)
      const { accessToken, refreshToken } = authRes.data
      const user = await fetchCurrentUser(accessToken)
      return { user, token: accessToken, refreshToken, redirectTo }
    },
    onSuccess: ({ user, token, refreshToken, redirectTo }) => {
      setAuth(user, token, refreshToken)
      router.push(redirectTo)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout')
      } catch {
        // ignore - clear local state regardless
      }
    },
    onSettled: () => {
      clearAuth()
      router.push('/login')
    },
  })

  return {
    login: (email: string, password: string, redirectTo = '/') =>
      loginMutation.mutateAsync({ payload: { email, password }, redirectTo }),
    register: (data: RegisterPayload, redirectTo = '/') =>
      registerMutation.mutateAsync({ payload: data, redirectTo }),
    logout: () => logoutMutation.mutate(),
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}

export default useAuth
