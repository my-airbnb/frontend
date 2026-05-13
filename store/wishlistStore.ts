import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistState {
  items: string[]
  toggle: (listingId: string) => void
  isWishlisted: (listingId: string) => boolean
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (listingId) => {
        const items = get().items
        if (items.includes(listingId)) {
          set({ items: items.filter((id) => id !== listingId) })
        } else {
          set({ items: [...items, listingId] })
        }
      },
      isWishlisted: (listingId) => get().items.includes(listingId),
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
