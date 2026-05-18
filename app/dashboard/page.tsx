'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { Calendar, Hop as Home, Plus, User, Heart, Inbox, DollarSign, Loader as Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import useWishlistStore from '@/store/wishlistStore'
import { useBookings } from '@/hooks/useBookings'
import { useHostListings } from '@/hooks/useListings'
import BookingCard from '@/components/BookingCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HostListingBookings } from '@/components/dashboard/HostListingBookings'
import { SavedListingCard } from '@/components/dashboard/SavedListingCard'
import { HostEarningsTab } from '@/components/dashboard/HostEarningsTab'
import { HostListingsTab } from '@/components/dashboard/HostListingsTab'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Tab = 'bookings' | 'listings' | 'incoming' | 'saved' | 'earnings'

const tabs: { id: Tab; label: string; icon: React.ElementType; hostOnly?: boolean }[] = [
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'saved', label: 'Saved', icon: Heart },
  { id: 'incoming', label: 'Incoming Bookings', icon: Inbox, hostOnly: true },
  { id: 'listings', label: 'My Listings', icon: Home, hostOnly: true },
  { id: 'earnings', label: 'Earnings', icon: DollarSign, hostOnly: true },
]

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { getItems, setactiveUser } = useWishlistStore()
  const [activeTab, setActiveTab] = useState<Tab>('bookings')

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.push('/login')
  }, [hasHydrated, isAuthenticated, router])

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment successful! Your booking is confirmed.')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      router.replace('/dashboard')
    }
  }, [searchParams, queryClient, router])

  if (user?.id) setactiveUser(user.id)
  const wishlistItems = getItems()

  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: hostListings, isLoading: listingsLoading } = useHostListings()

  if (!hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  const isHost = user.role === 'HOST' || user.role === 'ADMIN'
  const visibleTabs = tabs.filter((t) => !t.hostOnly || isHost)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-lg font-bold">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Welcome, {user.firstName}!</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3" />
                  {user.role} · {user.email}
                </p>
              </div>
            </div>
            {isHost && (
              <Button asChild className="self-start sm:self-auto">
                <Link href="/host/new-listing">
                  <Plus className="mr-2 h-4 w-4" />
                  New Listing
                </Link>
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8 overflow-x-auto scrollbar-hide">
            <nav className="flex gap-0 min-w-max">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const count =
                  tab.id === 'bookings' ? bookings?.length :
                  tab.id === 'saved' ? wishlistItems.length :
                  tab.id === 'listings' ? hostListings?.length :
                  undefined
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                      isActive ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {count != null && count > 0 && (
                      <span className="bg-secondary text-secondary-foreground text-xs px-1.5 py-0.5 rounded-full">{count}</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'bookings' && (
            bookingsLoading ? (
              <LoadingSkeleton count={3} />
            ) : !bookings?.length ? (
              <div className="text-center py-20">
                <Calendar className="h-16 w-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">Start exploring and book your first stay!</p>
                <Button asChild><Link href="/">Explore listings</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.filter(Boolean).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )
          )}

          {activeTab === 'saved' && (
            !wishlistItems.length ? (
              <div className="text-center py-20">
                <Heart className="h-16 w-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved places</h3>
                <p className="text-muted-foreground mb-6">Tap the heart on any listing to save it for later.</p>
                <Button asChild><Link href="/">Explore listings</Link></Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistItems.map((id) => <SavedListingCard key={id} listingId={id} />)}
              </div>
            )
          )}

          {activeTab === 'incoming' && isHost && (
            listingsLoading ? <LoadingSkeleton count={3} /> :
            !hostListings?.length ? (
              <div className="text-center py-20">
                <Inbox className="h-16 w-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-6">Create a listing to start receiving bookings.</p>
                <Button asChild><Link href="/host/new-listing">Create a listing</Link></Button>
              </div>
            ) : (
              <div className="space-y-10">
                <p className="text-sm text-muted-foreground">Bookings from guests, grouped by listing.</p>
                {hostListings.map((listing) => (
                  <HostListingBookings key={listing.id} listingId={listing.id} listingTitle={listing.title} />
                ))}
              </div>
            )
          )}

          {activeTab === 'listings' && isHost && (
            <HostListingsTab listingsLoading={listingsLoading} hostListings={hostListings} />
          )}

          {activeTab === 'earnings' && isHost && (
            <HostEarningsTab hostListings={hostListings} listingsLoading={listingsLoading} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  )
}
