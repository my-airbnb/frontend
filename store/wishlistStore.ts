import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import apiClient from '@/lib/axios'

interface WishlistState {
  items: Record<string, string[]>
  activeUser: string | null
  syncedUser: string | null
  setactiveUser: (userId: string | null) => void
  toggle: (listingId: string) => void
  isWishlisted: (listingId: string) => boolean
  getItems: () => string[]
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: {},
      activeUser: null,
      syncedUser: null,

      setactiveUser: (userId: string | null) => {
        set({ activeUser: userId })
        // On (re)login, pull the authoritative saved list from the backend so
        // wishlists persist across devices. Local state is the optimistic cache.
        if (userId && get().syncedUser !== userId) {
          set({ syncedUser: userId })
          apiClient
            .get<{ listingIds: string[] }>('/wishlists/me')
            .then((res) => {
              const ids = Array.isArray(res.data?.listingIds) ? res.data.listingIds : []
              set((state) => ({ items: { ...state.items, [userId]: ids } }))
            })
            .catch(() => {
              /* offline / not logged in yet — keep the local cache */
            })
        }
      },

      toggle: (listingId) => {
        const { items, activeUser } = get()
        if (!activeUser) return
        const userItems = items[activeUser] || []
        const has = userItems.includes(listingId)
        const next = has ? userItems.filter((id) => id !== listingId) : [...userItems, listingId]
        // optimistic local update
        set({ items: { ...items, [activeUser]: next } })
        // persist to the backend; revert on failure
        const req = has
          ? apiClient.delete(`/wishlists/me/items/${listingId}`)
          : apiClient.post(`/wishlists/me/items/${listingId}`)
        req.catch(() => {
          set((state) => ({ items: { ...state.items, [activeUser]: userItems } }))
        })
      },

      isWishlisted: (listingId) => {
        const { items, activeUser } = get()
        if (!activeUser) return false
        return (items[activeUser] || []).includes(listingId)
      },

      getItems: () => {
        const { items, activeUser } = get()
        if (!activeUser) return []
        return items[activeUser] || []
      },
    }),
    {
      name: 'airbnb-wishlist',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      // Only cache the items; activeUser/syncedUser reset on reload so we
      // re-sync from the backend on the next login.
      partialize: (state) => ({ items: state.items }) as WishlistState,
    }
  )
)

export default useWishlistStore
