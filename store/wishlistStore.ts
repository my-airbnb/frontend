import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistState {
  items: Record<string, string[]>
  activeUser: string | null
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
      setactiveUser: (userId: string | null) => {
        set({ activeUser: userId })
      },
      toggle: (listingId) => {
        const { items, activeUser } = get()
        if (!activeUser) return
        const userItems = items[activeUser] || []
        if (userItems.includes(listingId)) {
          set({ items: { ...items, [activeUser]: userItems.filter((id) => id !== listingId) } })
        } else {
          set({ items: { ...items, [activeUser]: [...userItems, listingId] } })
        }
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
    }
  )
)

export default useWishlistStore
