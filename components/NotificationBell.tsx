'use client'

import { useRouter } from 'next/navigation'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'

export function NotificationBell() {
  const router = useRouter()
  const hydrated = useHasHydrated()
  const { isAuthenticated } = useAuthStore()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  if (!hydrated || !isAuthenticated) return null

  const unread = notifications.filter((n) => !n.read).length

  const open = (id: string, read: boolean, link?: string) => {
    if (!read) markRead.mutate(id)
    if (link) router.push(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3.5 w-3.5" />Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto no-scrollbar">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => open(n.id, n.read, n.link)}
                className={cn(
                  'flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted/60',
                  !n.read && 'bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
                    n.read ? 'bg-transparent' : 'bg-destructive',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{n.title}</span>
                  <span className="block text-xs text-muted-foreground line-clamp-2">{n.message}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground/70">
                    {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
