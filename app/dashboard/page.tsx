'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Calendar, Home, Plus, User, Heart, Inbox,
  Edit2, Trash2, Check, X, DollarSign, Loader2
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import useWishlistStore from '@/store/wishlistStore'
import { useBookings, useListingBookings, useAllListingBookings, useConfirmBooking, useRejectBooking } from '@/hooks/useBookings'
import { useHostListings, useListing, useDeleteListing } from '@/hooks/useListings'
import BookingCard from '@/components/BookingCard'
import ListingCard from '@/components/ListingCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { toast } from 'sonner'
import { Listing } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'bookings' | 'listings' | 'incoming' | 'saved' | 'earnings'

function HostListingBookings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)
  const { mutate: confirm, isPending: isConfirming } = useConfirmBooking()
  const { mutate: reject, isPending: isRejecting } = useRejectBooking()

  if (isLoading) return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-muted rounded w-1/2" />
      <div className="h-20 bg-muted rounded-xl" />
    </div>
  )

  if (!bookings?.length) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">{listingTitle}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.filter(Boolean).map((booking) => (
          <div key={booking.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground">{booking.id.substring(0, 8)}…</span>
              <Badge variant={
                booking.status === 'CONFIRMED' ? 'default' :
                booking.status === 'PENDING' ? 'secondary' :
                booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'destructive' : 'outline'
              }>
                {booking.status}
              </Badge>
            </div>
            <p className="text-sm mb-1">{booking.checkIn} → {booking.checkOut}</p>
            <p className="text-sm mb-3">{booking.nbGuests} guest{booking.nbGuests !== 1 ? 's' : ''} · <span className="font-semibold">${booking.totalPrice}</span></p>
            {booking.status === 'PENDING' && (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => confirm(booking.id, { onSuccess: () => toast.success('Booking confirmed!') })} disabled={isConfirming || isRejecting}>
                  <Check className="h-3.5 w-3.5 mr-1" />Approve
                </Button>
                <Button size="sm" variant="destructive" className="flex-1" onClick={() => reject(booking.id, { onSuccess: () => toast.success('Booking rejected.') })} disabled={isConfirming || isRejecting}>
                  <X className="h-3.5 w-3.5 mr-1" />Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SavedListingCard({ listingId }: { listingId: string }) {
  const { data: listing, isLoading } = useListing(listingId)
  if (isLoading) return (
    <div className="animate-pulse">
      <div className="aspect-square rounded-2xl bg-muted mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  )
  if (!listing) return null
  return <ListingCard listing={listing} />
}

function ListingEarnings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)
  if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded-xl" />
  const confirmed = (bookings || []).filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
  const total = confirmed.reduce((sum, b) => sum + b.totalPrice, 0)
  if (!confirmed.length) return null
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
      <div>
        <p className="text-sm font-semibold truncate max-w-[220px]">{listingTitle}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{confirmed.length} confirmed booking{confirmed.length !== 1 ? 's' : ''}</p>
      </div>
      <span className="text-lg font-bold">${total.toLocaleString()}</span>
    </div>
  )
}

function HostEarningsTab({ hostListings, listingsLoading }: { hostListings: Listing[] | undefined; listingsLoading: boolean }) {
  const { data: allListingBookings, isLoading: earningsLoading } = useAllListingBookings((hostListings || []).map((l) => l.id))
  const confirmedBookings = allListingBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')

  if (listingsLoading || earningsLoading) return <LoadingSkeleton count={3} />
  if (!hostListings?.length) return (
    <div className="text-center py-20">
      <DollarSign className="h-16 w-16 text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No earnings yet</h3>
      <p className="text-muted-foreground">Create a listing to start earning.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-foreground text-background rounded-2xl p-6">
          <p className="text-sm opacity-70 mb-1">Total earned</p>
          <p className="text-3xl font-bold">${confirmedBookings.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Confirmed bookings</p>
          <p className="text-3xl font-bold">{confirmedBookings.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted-foreground mb-1">Active listings</p>
          <p className="text-3xl font-bold">{hostListings.length}</p>
        </div>
      </div>
      <div>
        <h3 className="text-base font-semibold mb-3">By listing</h3>
        <div className="space-y-3">
          {hostListings.map((listing) => (
            <ListingEarnings key={listing.id} listingId={listing.id} listingTitle={listing.title} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HostListingsTab({ listingsLoading, hostListings }: { listingsLoading: boolean; hostListings: Listing[] | undefined }) {
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteListing(id, {
      onSuccess: () => toast.success('Listing deleted.'),
      onError: () => toast.error('Failed to delete listing.'),
    })
  }

  if (listingsLoading) return <LoadingSkeleton count={4} />
  if (!hostListings?.length) return (
    <div className="text-center py-20">
      <Home className="h-16 w-16 text-muted mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
      <p className="text-muted-foreground mb-6">Start hosting and create your first listing!</p>
      <Button asChild><Link href="/host/new-listing">Create a listing</Link></Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {hostListings.map((listing) => (
        <div key={listing.id} className="group relative">
          <ListingCard listing={listing} />
          <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full shadow" asChild>
              <Link href={`/host/edit-listing/${listing.id}`} title="Edit">
                <Edit2 className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="icon" variant="secondary"
              className="h-7 w-7 rounded-full shadow text-destructive hover:text-destructive"
              onClick={() => handleDelete(listing.id, listing.title)}
              disabled={isDeleting}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

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
  const { items: wishlistItems } = useWishlistStore()
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
