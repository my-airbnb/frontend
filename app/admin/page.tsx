'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Home, Calendar, Star, Shield, Loader2 } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useListingsInfinite } from '@/hooks/useListings'
import { useAllBookings } from '@/hooks/useBookings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const hasHydrated = useHasHydrated()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') router.push('/')
  }, [hasHydrated, isAuthenticated, user, router])

  const { data: listingPages } = useListingsInfinite({})
  const { data: bookings } = useAllBookings()

  const listings = listingPages?.pages.flatMap((p) => p.content ?? []) ?? []
  const confirmedBookings = (bookings ?? []).filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
  const totalRevenue = confirmedBookings.reduce((s, b) => s + b.totalPrice, 0)

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
  }

  const stats = [
    { icon: Home, label: 'Total listings', value: listings.length, color: 'text-blue-600 bg-blue-50' },
    { icon: Calendar, label: 'Total bookings', value: (bookings ?? []).length, color: 'text-green-600 bg-green-50' },
    { icon: Calendar, label: 'Confirmed', value: confirmedBookings.length, color: 'text-yellow-600 bg-yellow-50' },
    { icon: Star, label: 'Platform revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-purple-600 bg-purple-50' },
  ]

  const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    CONFIRMED: 'default',
    PENDING: 'secondary',
    CANCELLED: 'destructive',
    REJECTED: 'destructive',
    COMPLETED: 'outline',
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Link>
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground text-sm mt-0.5">Platform overview</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
                  <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              )
            })}
          </div>

          {/* Recent listings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Home className="h-5 w-5" />Recent listings
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">Title</th>
                    <th className="text-left px-5 py-3 font-semibold">City</th>
                    <th className="text-left px-5 py-3 font-semibold">Price/night</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Host</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listings.slice(0, 10).map((listing) => (
                    <tr key={listing.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/listings/${listing.id}`} className="text-primary hover:underline font-medium">
                          {listing.title.slice(0, 45)}{listing.title.length > 45 ? '…' : ''}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{listing.city}</td>
                      <td className="px-5 py-3 font-medium">${listing.pricePerNight}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{listing.hostId?.split('@')[0] ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listings.length === 0 && <div className="text-center py-8 text-muted-foreground">No listings found</div>}
            </div>
          </div>

          {/* Recent bookings */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />Recent bookings
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">ID</th>
                    <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Guest</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Dates</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(bookings ?? []).slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-muted-foreground">{booking.id.slice(0, 8)}…</td>
                      <td className="px-5 py-3 hidden sm:table-cell">{booking.guestId?.split('@')[0]}</td>
                      <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">{booking.checkIn} → {booking.checkOut}</td>
                      <td className="px-5 py-3">
                        <Badge variant={statusVariant[booking.status] || 'secondary'}>{booking.status}</Badge>
                      </td>
                      <td className="px-5 py-3 font-semibold">${booking.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(bookings ?? []).length === 0 && <div className="text-center py-8 text-muted-foreground">No bookings found</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
