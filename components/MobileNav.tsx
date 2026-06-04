'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Heart, CalendarDays, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import useWishlistStore from '@/store/wishlistStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'

const navItems = [
  { href: '/', label: 'Explore', icon: Search, exact: true },
  { href: '/wishlists', label: 'Wishlists', icon: Heart },
  { href: '/dashboard', label: 'Trips', icon: CalendarDays },
  { href: '/messages', label: 'Inbox', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  const hasHydrated = useHasHydrated()
  const { getItems } = useWishlistStore()
  const wishlistCount = hasHydrated ? getItems().length : 0

  // Hide the floating nav on focused/standalone flows: a listing detail (the
  // full-width Reserve bar owns the bottom), auth screens, checkout, and the
  // host listing wizard (multi-step forms need the full screen).
  const hideOn = ['/login', '/register', '/checkout', '/host']
  if (pathname.startsWith('/listings/') || hideOn.some((p) => pathname.startsWith(p))) {
    return null
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden bg-card/95 backdrop-blur-sm border border-border shadow-2xl rounded-full">
      <div className="flex items-center h-14 px-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
          const isWishlist = href === '/wishlists'
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-4 py-2 relative',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 1.75} />
                {isWishlist && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'font-semibold' : '')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
