'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiUsers, FiHome, FiCalendar, FiStar, FiShield } from 'react-icons/fi'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useListingsInfinite } from '@/hooks/useListings'
import { useAllBookings } from '@/hooks/useBookings'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [hasHydrated, isAuthenticated, user, router])

  const { data: listingPages } = useListingsInfinite({})
  const { data: bookings } = useAllBookings()

  const listings = listingPages?.pages.flatMap((p) => p.content ?? []) ?? []
  const confirmedBookings = (bookings ?? []).filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
  const totalRevenue = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0)

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <FiArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <FiShield className="w-8 h-8 text-gray-900" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform overview</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            icon: <FiHome className="w-6 h-6" />,
            label: 'Total listings',
            value: listings.length,
            color: 'bg-blue-50 text-blue-700',
          },
          {
            icon: <FiCalendar className="w-6 h-6" />,
            label: 'Total bookings',
            value: (bookings ?? []).length,
            color: 'bg-green-50 text-green-700',
          },
          {
            icon: <FiCalendar className="w-6 h-6" />,
            label: 'Confirmed bookings',
            value: confirmedBookings.length,
            color: 'bg-yellow-50 text-yellow-700',
          },
          {
            icon: <FiStar className="w-6 h-6" />,
            label: 'Platform revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            color: 'bg-purple-50 text-purple-700',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent listings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiHome className="w-5 h-5" />
          Recent listings
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">City</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Price/night</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.slice(0, 10).map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/listings/${listing.id}`} className="text-primary hover:underline font-medium">
                      {listing.title.slice(0, 45)}{listing.title.length > 45 ? '…' : ''}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{listing.city}</td>
                  <td className="px-5 py-3 text-gray-900 font-medium">${listing.pricePerNight}</td>
                  <td className="px-5 py-3 text-gray-500">{listing.hostId?.split('@')[0] ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 && (
            <div className="text-center py-8 text-gray-400">No listings found</div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiCalendar className="w-5 h-5" />
          Recent bookings
        </h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">ID</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Guest</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Dates</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(bookings ?? []).slice(0, 10).map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-gray-500">{booking.id.slice(0, 8)}…</td>
                  <td className="px-5 py-3 text-gray-700">{booking.guestId?.split('@')[0]}</td>
                  <td className="px-5 py-3 text-gray-600">{booking.checkIn} → {booking.checkOut}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'CANCELLED' || booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{booking.status}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">${booking.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(bookings ?? []).length === 0 && (
            <div className="text-center py-8 text-gray-400">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  )
}
