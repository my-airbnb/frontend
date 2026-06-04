"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Menu, User, LogOut, LayoutDashboard, Settings, Shield, Circle as HelpCircle } from "lucide-react"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import useAuthStore from "@/store/authStore"
import useAuth from "@/hooks/useAuth"
import { useHasHydrated } from "@/hooks/useHasHydrated"

export function Header({ showSearch = true }: { showSearch?: boolean } = {}) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const hydrated = useHasHydrated()

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 lg:h-16 lg:px-8">
        {/* Logo */}
        <Logo responsiveWordmark />

        {/* Search Bar - Desktop (hidden where a dedicated page search exists, e.g. home) */}
        {showSearch && (
          <div className="hidden md:flex items-center rounded-full border border-border bg-card px-2 py-1 shadow-sm hover:shadow-md cursor-pointer" onClick={() => router.push('/?focus=search')}>
            <span className="px-4 py-2 text-sm font-medium text-foreground">
              Anywhere
            </span>
            <span className="h-6 w-px bg-border" />
            <span className="px-4 py-2 text-sm font-medium text-foreground">
              Any week
            </span>
            <span className="h-6 w-px bg-border" />
            <span className="px-4 py-2 text-sm text-muted-foreground">
              Add guests
            </span>
            <Button size="icon" className="h-8 w-8 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Mobile Search */}
        {showSearch && (
          <Button variant="outline" size="sm" className="md:hidden rounded-full px-3" onClick={() => router.push('/?focus=search')}>
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm">Search</span>
          </Button>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <Link href="/host/new-listing" className="hidden lg:block">
            <Button variant="ghost" size="sm" className="font-medium">
              Host your place
            </Button>
          </Link>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full gap-2 pl-2.5 pr-1.5 ml-1">
                <Menu className="h-4 w-4" />
                {hydrated && isAuthenticated && user ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {hydrated && isAuthenticated && user ? (
                <>
                  <div className="px-2 py-1.5 text-sm font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="px-2 pb-1.5 text-xs text-muted-foreground">{user.email}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/host/new-listing" className="w-full">
                      Host your place
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="font-medium">Sign up</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login">Log in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/host/new-listing" className="w-full">Host your place</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="https://help.airbnb.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full">
                      <HelpCircle className="h-4 w-4" />
                      Help Center
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
