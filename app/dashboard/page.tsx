'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { FiCalendar, FiHome, FiPlus, FiUser, FiHeart, FiInbox, FiEdit2, FiTrash2, FiCheck, FiX, FiDollarSign } from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import useWishlistStore from '@/store/wishlistStore'
import { useBookings, useListingBookings, useAllListingBookings, useConfirmBooking, useRejectBooking } from '@/hooks/useBookings'
import { useHostListings, useListing, useDeleteListing } from '@/hooks/useListings'
import BookingCard from '@/components/BookingCard'
import ListingCard from '@/components/ListingCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import toast from 'react-hot-toast'
import { Listing } from '@/types'

type Tab = 'bookings' | 'listings' | 'incoming' | 'saved' | 'earnings'

// Renders bookings for a single host listing — used to aggregate across all listings
function HostListingBookings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)
  const { mutate: confirm, isPending: isConfirming } = useConfirmBooking()
  const { mutate: reject, isPending: isRejecting } = useRejectBooking()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!bookings || bookings.length === 0) return null

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {listingTitle}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.filter(Boolean).map((booking) => (
          <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-gray-500">{booking.id.substring(0, 8)}…</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {booking.status}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Guest:</span> {booking.guestId}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              {booking.checkIn} → {booking.checkOut}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              {booking.nbGuests} guest{booking.nbGuests !== 1 ? 's' : ''} · <span className="font-semibold">${booking.totalPrice}</span>
            </p>

            {booking.status === 'PENDING' && (
              <div className="flex gap-2">
                <button
                  onClick={() => confirm(booking.id, { onSuccess: () => toast.success('Booking confirmed!') })}
                  disabled={isConfirming || isRejecting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => reject(booking.id, { onSuccess: () => toast.success('Booking rejected.') })}
                  disabled={isConfirming || isRejecting}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  <FiX className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Renders a single saved listing card by ID
function SavedListingCard({ listingId }: { listingId: string }) {
  const { data: listing, isLoading } = useListing(listingId)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="aspect-square rounded-2xl bg-gray-200 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  if (!listing) return null

  return <ListingCard listing={listing} />
}

function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()
  const { items: wishlistItems } = useWishlistStore()
  const [activeTab, setActiveTab] = useState<Tab>('bookings')

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login')
    }
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  const isHost = user.role === 'HOST' || user.role === 'ADMIN'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Welcome, {user.firstName}!
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
              <FiUser className="w-3 h-3 flex-shrink-0" />
              {user.role} &bull; {user.email}
            </p>
          </div>
        </div>

        {isHost && (
          <Link
            href="/host/new-listing"
            className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            <FiPlus className="w-4 h-4" />
            New Listing
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        <nav className="flex gap-0 min-w-max">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiCalendar className="w-4 h-4" />
            My Bookings
            {bookings && bookings.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'saved'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiHeart className="w-4 h-4" />
            Saved
            {wishlistItems.length > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {wishlistItems.length}
              </span>
            )}
          </button>

          {isHost && (
            <>
              <button
                onClick={() => setActiveTab('incoming')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'incoming'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiInbox className="w-4 h-4" />
                Incoming Bookings
              </button>

              <button
                onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'listings'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiHome className="w-4 h-4" />
                My Listings
                {hostListings && hostListings.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    {hostListings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('earnings')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'earnings'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiDollarSign className="w-4 h-4" />
                Earnings
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'bookings' && (
        <div>
          {bookingsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="text-center py-20">
              <FiCalendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">
                Start exploring and book your first stay!
              </p>
              <Link href="/" className="btn-primary inline-block">
                Explore listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.filter(Boolean).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div className="text-center py-20">
              <FiHeart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No saved places</h3>
              <p className="text-gray-500 mb-6">
                Tap the heart on any listing to save it for later.
              </p>
              <Link href="/" className="btn-primary inline-block">
                Explore listings
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((id) => (
                <SavedListingCard key={id} listingId={id} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'incoming' && isHost && (
        <div>
          {listingsLoading ? (
            <LoadingSkeleton count={3} />
          ) : !hostListings || hostListings.length === 0 ? (
            <div className="text-center py-20">
              <FiInbox className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Create a listing to start receiving bookings.</p>
              <Link href="/host/new-listing" className="btn-primary inline-block">
                Create a listing
              </Link>
            </div>
          ) : (
            <div className="space-y-10">
              <p className="text-sm text-gray-500">Bookings from guests, grouped by listing.</p>
              {hostListings.map((listing) => (
                <HostListingBookings
                  key={listing.id}
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && isHost && (
        <HostListingsTab listingsLoading={listingsLoading} hostListings={hostListings} />
      )}

      {activeTab === 'earnings' && isHost && (
        <HostEarningsTab hostListings={hostListings} listingsLoading={listingsLoading} />
      )}
    </div>
  )
}

function ListingEarnings({ listingId, listingTitle }: { listingId: string; listingTitle: string }) {
  const { data: bookings, isLoading } = useListingBookings(listingId)

  if (isLoading) return <div className="animate-pulse h-16 bg-gray-100 rounded-xl" />

  const confirmed = (bookings || []).filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
  const total = confirmed.reduce((sum, b) => sum + b.totalPrice, 0)
  if (confirmed.length === 0) return null

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl">
      <div>
        <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">{listingTitle}</p>
        <p className="text-xs text-gray-500 mt-0.5">{confirmed.length} confirmed booking{confirmed.length !== 1 ? 's' : ''}</p>
      </div>
      <span className="text-lg font-bold text-gray-900">${total.toLocaleString()}</span>
    </div>
  )
}

function HostEarningsTab({
  hostListings,
  listingsLoading,
}: {
  hostListings: Listing[] | undefined
  listingsLoading: boolean
}) {
  const { data: allListingBookings, isLoading: earningsLoading } = useAllListingBookings(
    (hostListings || []).map((l) => l.id)
  )

  const confirmedBookings = allListingBookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
  )

  if (listingsLoading || earningsLoading) return <LoadingSkeleton count={3} />

  if (!hostListings || hostListings.length === 0) {
    return (
      <div className="text-center py-20">
        <FiDollarSign className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No earnings yet</h3>
        <p className="text-gray-500">Create a listing to start earning.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-6">
          <p className="text-sm text-white/70 mb-1">Total earned</p>
          <p className="text-3xl font-bold">
            ${confirmedBookings.reduce((s, b) => s + b.totalPrice, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Confirmed bookings</p>
          <p className="text-3xl font-bold text-gray-900">{confirmedBookings.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-sm text-gray-500 mb-1">Active listings</p>
          <p className="text-3xl font-bold text-gray-900">{hostListings.length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">By listing</h3>
        <div className="space-y-3">
          {hostListings.map((listing) => (
            <ListingEarnings key={listing.id} listingId={listing.id} listingTitle={listing.title} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HostListingsTab({
  listingsLoading,
  hostListings,
}: {
  listingsLoading: boolean
  hostListings: Listing[] | undefined
}) {
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing()

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    deleteListing(id, {
      onSuccess: () => toast.success('Listing deleted.'),
      onError: () => toast.error('Failed to delete listing.'),
    })
  }

  if (listingsLoading) return <LoadingSkeleton count={4} />

  if (!hostListings || hostListings.length === 0) {
    return (
      <div className="text-center py-20">
        <FiHome className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No listings yet</h3>
        <p className="text-gray-500 mb-6">Start hosting and create your first listing!</p>
        <Link href="/host/new-listing" className="btn-primary inline-block">Create a listing</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {hostListings.map((listing) => (
        <div key={listing.id} className="group relative">
          <ListingCard listing={listing} />
          {/* Edit / Delete overlay */}
          <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <Link
              href={`/host/edit-listing/${listing.id}`}
              className="p-1.5 bg-white rounded-full shadow text-gray-700 hover:text-primary"
              title="Edit listing"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => handleDelete(listing.id, listing.title)}
              disabled={isDeleting}
              className="p-1.5 bg-white rounded-full shadow text-gray-700 hover:text-red-600 disabled:opacity-50"
              title="Delete listing"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
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
