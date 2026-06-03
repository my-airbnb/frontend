import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string, refreshToken?: string) => void
  clearAuth: () => void
}

const AUTH_STORAGE_KEYS = ['auth-storage']

function setSessionCookie() {
  if (typeof document === 'undefined') return
  // SameSite=Lax (not Strict): a Strict cookie is NOT sent on a top-level
  // navigation that originates from another site — e.g. when Stripe redirects
  // back to /dashboard after 3-D Secure. The middleware that gates /dashboard
  // and /checkout then sees no cookie and bounces the user to /login (which,
  // for a Google user, re-prompts Google sign-in). Lax is sent on top-level
  // GET navigations including that return, while still blocking cross-site POST.
  document.cookie = 'auth-session=1; Path=/; SameSite=Lax; Max-Age=86400'
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'auth-session=; Path=/; SameSite=Lax; Max-Age=0'
}

function clearAuthStorage() {
  if (typeof window === 'undefined') return
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string, refreshToken?: string) => {
        set({ user, token, refreshToken: refreshToken ?? null, isAuthenticated: true })
        setSessionCookie()
        // H5: ensure wishlist store knows the active user so the heart toggle works
        // immediately after login without requiring a dashboard visit first.
        // Dynamic require avoids the circular import (wishlistStore imports nothing from here).
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { default: useWishlistStore } = require('@/store/wishlistStore')
          useWishlistStore.getState().setactiveUser(user.id)
        }
      },

      clearAuth: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
        clearAuthStorage()
        clearSessionCookie()
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { default: useWishlistStore } = require('@/store/wishlistStore')
          useWishlistStore.getState().setactiveUser(null)
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) setSessionCookie()
      },
    }
  )
)

export default useAuthStore
