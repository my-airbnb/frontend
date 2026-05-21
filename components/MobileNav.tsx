'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Heart, CalendarDays, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import useWishlistStore from '@/store/wishlistStore'

const navItems = [
  { href: '/', label: 'Explore', icon: Search, exact: true },
  { href: '/wishlists', label: 'Wishlists', icon: Heart },
  { href: '/dashboard', label: 'Trips', icon: CalendarDays },
  { href: '/messages', label: 'Inbox', icon: MessageSquare },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()
  const { getItems } = useWishlistStore()
  const wishlistCount = getItems().length

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
          const isWishlist = href === '/wishlists'
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-2 relative',
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
